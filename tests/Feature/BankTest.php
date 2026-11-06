<?php

namespace Tests\Feature;

use App\Models\Audit;
use App\Models\Category;
use App\Models\Deposit;
use App\Models\Entry;
use App\Models\User;
use App\Models\Withdrawal;
use App\Services\BankService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class BankTest extends TestCase
{
    use RefreshDatabase;

    private User $member;

    private User $staff;

    private BankService $bank;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed();
        $this->member = User::factory()->create();
        $this->staff = User::factory()->create();
        $this->staff->forceFill(['role' => 'staff'])->save();
        $this->bank = new BankService;
    }

    private function deposit(): Deposit
    {
        return $this->bank->record($this->staff, ['user_id' => $this->member->id, 'category_id' => Category::where('name', 'Plastik PET')->first()->id, 'weight_kg' => '2.500']);
    }

    private function credit(): Deposit
    {
        $d = $this->deposit();
        $this->bank->reviewDeposit($this->staff, $d->id, 'verify', 'Berat diperiksa');

        return $d;
    }

    public function test_registration_cannot_assign_role_or_balance(): void
    {
        $this->post('/daftar', ['name' => 'Anggota', 'email' => 'anggota@example.test', 'password' => $p = Str::random(20), 'password_confirmation' => $p, 'role' => 'staff', 'balance' => 999999])->assertRedirect('/beranda');
        $u = User::where('email', 'anggota@example.test')->first();
        $this->assertSame('member', $u->role);
        $this->assertSame(0, $u->balance);
    }

    public function test_pending_deposit_does_not_credit_and_uses_integer_grams(): void
    {
        $d = $this->deposit();
        $this->assertSame(2500, $d->weight_g);
        $this->assertSame(8750, $d->amount);
        $this->assertSame(0, $this->member->fresh()->balance);
        $this->assertSame(0, Entry::count());
    }

    public function test_verification_credits_only_once(): void
    {
        $d = $this->credit();
        $this->assertSame(8750, $this->member->fresh()->balance);
        $this->actingAs($this->staff)->patch('/petugas/setoran/'.$d->id, ['action' => 'verify', 'reason' => 'Periksa ulang'])->assertSessionHasErrors('action');
        $this->assertSame(1, Entry::count());
        $this->assertSame(8750, $this->member->fresh()->balance);
    }

    public function test_withdrawals_reserve_available_balance(): void
    {
        $this->credit();
        $this->bank->withdraw($this->member, 6000);
        $this->assertSame(2750, $this->bank->available($this->member->fresh()));
        $this->actingAs($this->member)->post('/penarikan', ['amount' => 3000])->assertSessionHasErrors('amount');
        $this->assertSame(1, Withdrawal::count());
    }

    public function test_withdrawal_approval_debits_once(): void
    {
        $this->credit();
        $w = $this->bank->withdraw($this->member, 5000);
        $this->bank->reviewWithdrawal($this->staff, $w->id, 'approve', 'Tunai diterima anggota');
        $this->assertSame(3750, $this->member->fresh()->balance);
        $this->assertSame(3750, $this->bank->available($this->member->fresh()));
        $this->actingAs($this->staff)->patch('/petugas/penarikan/'.$w->id, ['action' => 'approve', 'reason' => 'Konfirmasi ulang'])->assertSessionHasErrors('action');
        $this->assertSame(2, Entry::count());
    }

    public function test_rejected_withdrawal_releases_reservation(): void
    {
        $this->credit();
        $w = $this->bank->withdraw($this->member, 5000);
        $this->bank->reviewWithdrawal($this->staff, $w->id, 'reject', 'Atas permintaan anggota');
        $this->assertSame(8750, $this->bank->available($this->member->fresh()));
        $this->assertSame(1, Entry::count());
    }

    public function test_void_cannot_spend_reserved_balance(): void
    {
        $d = $this->credit();
        $this->bank->withdraw($this->member, 5000);
        $this->actingAs($this->staff)->patch('/petugas/setoran/'.$d->id, ['action' => 'void', 'reason' => 'Koreksi kesalahan timbang'])->assertSessionHasErrors('action');
        $this->assertSame('verified', $d->fresh()->status);
        $this->assertSame(8750, $this->member->fresh()->balance);
    }

    public function test_void_is_append_only_and_audited(): void
    {
        $d = $this->credit();
        $this->bank->reviewDeposit($this->staff, $d->id, 'void', 'Koreksi berat timbangan');
        $this->assertSame(0, $this->member->fresh()->balance);
        $this->assertSame(2, Entry::count());
        $this->assertSame(-8750, Entry::latest('id')->first()->amount);
        $this->assertSame('voided', $d->fresh()->status);
        $this->assertSame(3, Audit::count());
    }

    public function test_price_updates_do_not_change_recorded_deposits(): void
    {
        $d = $this->deposit();
        Category::whereKey($d->category_id)->update(['price' => 5000]);
        $this->bank->reviewDeposit($this->staff, $d->id, 'verify', 'Harga lama saat setoran');
        $this->assertSame(8750, $this->member->fresh()->balance);
        $this->assertSame(3500, $d->fresh()->price);
    }

    public function test_member_cannot_access_staff_operations(): void
    {
        $this->actingAs($this->member)->post('/petugas/setoran', [])->assertForbidden();
        $this->get('/petugas/laporan')->assertForbidden();
        $this->post('/petugas/kategori', [])->assertForbidden();
    }

    public function test_member_cannot_read_other_member_data(): void
    {
        $other = User::factory()->create();
        $this->credit();
        $this->actingAs($other)->get('/beranda')->assertInertia(fn ($p) => $p->where('deposits.data', [])->where('entries.data', [])->where('members', [])->where('audits', []));
    }

    public function test_weight_precision_and_negative_values_rejected(): void
    {
        foreach (['-1', '1.0001', '0', '1001', '1e2'] as $weight) {
            $this->actingAs($this->staff)->post('/petugas/setoran', ['user_id' => $this->member->id, 'category_id' => Category::first()->id, 'weight_kg' => $weight])->assertSessionHasErrors('weight_kg');
        }$this->assertSame(0, Deposit::count());
    }

    public function test_inactive_category_rejected(): void
    {
        $c = Category::first();
        $c->update(['active' => false]);
        $this->actingAs($this->staff)->post('/petugas/setoran', ['user_id' => $this->member->id, 'category_id' => $c->id, 'weight_kg' => '1'])->assertNotFound();
    }

    public function test_reports_use_verified_ledger_and_date_filter(): void
    {
        $this->deposit();
        $d = $this->credit();
        $this->actingAs($this->staff)->get('/petugas/laporan')->assertInertia(fn ($p) => $p->where('summary.credited', 8750));
        $this->bank->reviewDeposit($this->staff, $d->id, 'void', 'Perubahan berat salah');
        $this->get('/petugas/laporan')->assertInertia(fn ($p) => $p->where('summary.reversed', 8750)->where('weights', []));
        $this->get('/petugas/laporan?from=2000-01-01&to=2000-01-02')->assertInertia(fn ($p) => $p->where('summary.credited', 0));
    }

    public function test_csv_exports_real_mutations_and_escapes_names(): void
    {
        $this->member->name = '=FORMULA';
        $this->member->save();
        $this->credit();
        $r = $this->actingAs($this->staff)->get('/petugas/laporan?export=csv');
        $r->assertDownload('laporan-bank-sampah.csv');
        $this->assertStringContainsString("'=FORMULA", $r->streamedContent());
        $this->assertStringContainsString('8750', $r->streamedContent());
    }

    public function test_rejection_preserves_balance(): void
    {
        $d = $this->deposit();
        $this->bank->reviewDeposit($this->staff, $d->id, 'reject', 'Berat tidak sesuai');
        $this->assertSame('rejected', $d->fresh()->status);
        $this->assertSame(0, $this->member->fresh()->balance);
        $this->assertSame(0, Entry::count());
    }

    public function test_unverified_balance_cannot_be_withdrawn(): void
    {
        $this->deposit();
        $this->actingAs($this->member)->post('/penarikan', ['amount' => 1000])->assertSessionHasErrors('amount');
    }

    public function test_staff_cannot_create_withdrawal_as_member(): void
    {
        $this->actingAs($this->staff)->post('/penarikan', ['amount' => 1000])->assertForbidden();
    }

    public function test_audit_reason_is_required(): void
    {
        $d = $this->deposit();
        $this->actingAs($this->staff)->patch('/petugas/setoran/'.$d->id,['action' => 'verify'])->assertSessionHasErrors('reason');
        $this->assertSame(0,Entry::count());
    }
}
