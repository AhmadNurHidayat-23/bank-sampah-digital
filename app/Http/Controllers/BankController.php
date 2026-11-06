<?php

namespace App\Http\Controllers;

use App\Models\Audit;
use App\Models\Category;
use App\Models\Deposit;
use App\Models\Entry;
use App\Models\User;
use App\Models\Withdrawal;
use App\Services\BankService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BankController extends Controller
{
    public function index(Request $r, BankService $bank)
    {
        $staff = $r->user()->role === 'staff';
        $own = fn ($q) => $staff ? $q : $q->where('user_id', $r->user()->id);

        return Inertia::render('Bank', ['categories' => Category::orderBy('name')->get(), 'members' => $staff ? User::where('role', 'member')->orderBy('name')->get(['id', 'name', 'email', 'balance']) : [],
            'deposits' => $own(Deposit::query())->with('user:id,name')->latest()->paginate(20, ['*'], 'setoran_page')->withQueryString(),
            'withdrawals' => $own(Withdrawal::query())->with('user:id,name')->latest()->paginate(20, ['*'], 'tarik_page')->withQueryString(),
            'entries' => $own(Entry::query())->with('user:id,name')->latest()->paginate(30, ['*'], 'mutasi_page')->withQueryString(),
            'available' => $bank->available($r->user()), 'audits' => $staff ? Audit::with('actor:id,name')->latest()->limit(30)->get() : [],
            'summary' => ['members' => $staff ? User::where('role', 'member')->count() : null, 'liability' => $staff ? (int) User::where('role', 'member')->sum('balance') : $r->user()->balance, 'pendingDeposits' => $own(Deposit::query())->where('status', 'pending')->count(), 'weight' => $own(Deposit::query())->where('status', 'verified')->sum('weight_g')]]);
    }

    public function deposit(Request $r, BankService $b)
    {
        $d = $r->validate(['user_id' => 'required|integer|exists:users,id', 'category_id' => 'required|integer|exists:categories,id', 'weight_kg' => ['required', 'string', 'regex:/^(?:0|[1-9][0-9]{0,3})(?:\.[0-9]{1,3})?$/', 'numeric', 'min:0.001', 'max:1000'], 'note' => 'nullable|string|max:300']);
        abort_unless(User::findOrFail($d['user_id'])->role === 'member', 422);
        $b->record($r->user(), $d);

        return back()->with('success', 'Setoran dicatat. Saldo bertambah setelah diverifikasi.');
    }

    public function reviewDeposit(Request $r, int $id, BankService $b)
    {
        $d = $r->validate(['action' => 'required|in:verify,reject,void', 'reason' => 'required|string|min:5|max:300']);
        $b->reviewDeposit($r->user(), $id, $d['action'], $d['reason']);

        return back()->with('success', 'Setoran diperbarui dan dicatat dalam jejak audit.');
    }

    public function withdraw(Request $r, BankService $b)
    {
        abort_unless($r->user()->role === 'member', 403);
        $d = $r->validate(['amount' => 'required|integer|min:1000|max:100000000']);
        $b->withdraw($r->user(), $d['amount']);

        return back()->with('success', 'Penarikan diajukan. Saldo ditahan sampai diproses petugas.');
    }

    public function reviewWithdrawal(Request $r, int $id, BankService $b)
    {
        $d = $r->validate(['action' => 'required|in:approve,reject', 'reason' => 'required|string|min:5|max:300']);
        $b->reviewWithdrawal($r->user(), $id, $d['action'], $d['reason']);

        return back()->with('success', 'Penarikan diproses. Konfirmasi ini adalah pencatatan penyerahan tunai manual.');
    }

    public function category(Request $r, BankService $b, ?Category $category = null)
    {
        $d = $r->validate(['name' => 'required|string|max:60|unique:categories,name,'.($category?->id ?? 'NULL'), 'description' => 'required|string|max:200', 'price' => 'required|integer|min:100|max:500000', 'active' => 'required|boolean']);
        DB::transaction(function () use ($r, $b, $category, $d) {
            $before = $category?->toArray();
            $c = $category ?? new Category;
            $c->fill($d)->save();
            $b->audit($r->user(), 'category:'.$c->id, 'Harga/kategori diperbarui', ['before' => $before, 'after' => $c->toArray()]);
        });

        return back()->with('success','Kategori disimpan. Harga setoran lama tetap memakai harga saat pencatatan.');
    }
}
