<?php

namespace App\Services;

use App\Models\Audit;
use App\Models\Category;
use App\Models\Deposit;
use App\Models\Entry;
use App\Models\User;
use App\Models\Withdrawal;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BankService
{
    public function available(User $user): int
    {
        return (int) $user->balance - (int) Withdrawal::where('user_id', $user->id)->where('status', 'pending')->sum('amount');
    }

    public function audit(User $actor, string $subject, string $action, array $details): void
    {
        Audit::create(['actor_id' => $actor->id, 'subject' => $subject, 'action' => $action, 'details' => $details]);
    }

    public function record(User $actor, array $data): Deposit
    {
        return DB::transaction(function () use ($actor, $data) {
            $category = Category::where('active', true)->findOrFail($data['category_id']);
            $parts = explode('.', $data['weight_kg']);
            $grams = (int) $parts[0] * 1000 + (int) str_pad($parts[1] ?? '', 3, '0');
            $deposit = Deposit::create(['user_id' => $data['user_id'], 'category_id' => $category->id, 'category_name' => $category->name, 'weight_g' => $grams, 'price' => $category->price, 'amount' => intdiv($grams * $category->price + 500, 1000), 'note' => $data['note'] ?? null]);
            $this->audit($actor, 'deposit:'.$deposit->id, 'Dicatat', $deposit->toArray());

            return $deposit;
        });
    }

    private function post(User $user, string $source, string $kind, int $amount, string $description): void
    {
        $user->balance += $amount;
        $user->save();
        Entry::create(['user_id' => $user->id, 'source' => $source, 'kind' => $kind, 'amount' => $amount, 'balance_after' => $user->balance, 'description' => $description]);
    }

    public function reviewDeposit(User $actor, int $id, string $action, string $reason): void
    {
        DB::transaction(function () use ($actor, $id, $action, $reason) {
            $d = Deposit::lockForUpdate()->findOrFail($id);
            $u = User::lockForUpdate()->findOrFail($d->user_id);
            $before = $d->status;
            if ($action === 'verify' && $before === 'pending') {
                $this->post($u, 'deposit:'.$id, 'deposit', $d->amount, $d->category_name.' · '.($d->weight_g / 1000).' kg');
                $d->status = 'verified';
            } elseif ($action === 'reject' && $before === 'pending') {
                $d->status = 'rejected';
            } elseif ($action === 'void' && $before === 'verified') {
                if ($this->available($u) < $d->amount) {
                    throw ValidationException::withMessages(['action' => 'Saldo tersedia tidak cukup untuk membalikkan setoran.']);
                }
                $this->post($u, 'void:'.$id, 'reversal', -$d->amount, 'Pembalikan setoran #'.$id);
                $d->status = 'voided';
            } else {
                throw ValidationException::withMessages(['action' => 'Transaksi sudah diproses atau status tidak sesuai.']);
            }
            $d->save();
            $this->audit($actor, 'deposit:'.$id, 'Verifikasi/perubahan', ['from' => $before, 'to' => $d->status, 'reason' => $reason]);
        }, 3);
    }

    public function withdraw(User $member, int $amount): Withdrawal
    {
        return DB::transaction(function () use ($member, $amount) {
            $u = User::lockForUpdate()->findOrFail($member->id);
            if ($amount > $this->available($u)) {
                throw ValidationException::withMessages(['amount' => 'Nominal melebihi saldo tersedia.']);
            }
            $w = Withdrawal::create(['user_id' => $u->id, 'amount' => $amount]);
            $this->audit($u, 'withdrawal:'.$w->id, 'Penarikan diajukan', ['amount' => $amount]);

            return $w;
        }, 3);
    }

    public function reviewWithdrawal(User $actor, int $id, string $action, string $reason): void
    {
        DB::transaction(function () use ($actor, $id, $action, $reason) {
            $w = Withdrawal::lockForUpdate()->findOrFail($id);
            $u = User::lockForUpdate()->findOrFail($w->user_id);
            if ($w->status !== 'pending') {
                throw ValidationException::withMessages(['action' => 'Penarikan sudah diproses.']);
            }
            if ($action === 'approve') {
                if ($u->balance < $w->amount) {
                    throw ValidationException::withMessages(['action' => 'Saldo tidak cukup.']);
                }
                $this->post($u, 'withdrawal:'.$id, 'withdrawal', -$w->amount, 'Penarikan tunai #'.$id);
                $w->status = 'paid';
            } else {
                $w->status = 'rejected';
            }
            $w->note = $reason;
            $w->save();
            $this->audit($actor,'withdrawal:'.$id,'Penarikan diproses',['status' => $w->status, 'reason' => $reason]);
        }, 3);
    }
}
