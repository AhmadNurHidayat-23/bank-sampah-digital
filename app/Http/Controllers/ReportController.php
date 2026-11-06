<?php

namespace App\Http\Controllers;

use App\Models\Deposit;
use App\Models\Entry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $r)
    {
        $d = $r->validate(['from' => 'nullable|date_format:Y-m-d', 'to' => 'nullable|date_format:Y-m-d|after_or_equal:from', 'export' => 'nullable|in:csv']);
        $from = $d['from'] ?? now()->startOfMonth()->toDateString();
        $to = $d['to'] ?? now()->toDateString();
        $q = Entry::with('user:id,name')->whereDate('created_at', '>=', $from)->whereDate('created_at', '<=', $to);
        if ($r->input('export') === 'csv') {
            return response()->streamDownload(function () use ($q) {
                $o = fopen('php://output', 'w');
                fputcsv($o, ['Waktu', 'Anggota', 'Jenis', 'Nominal', 'Saldo setelah', 'Keterangan'], ',', '"', '');
                foreach ($q->orderBy('id')->cursor() as $e) {
                    fputcsv($o, [$e->created_at->toIso8601String(), $this->safe($e->user->name), $e->kind, $e->amount, $e->balance_after, $this->safe($e->description)], ',', '"', '');
                }fclose($o);
            }, 'laporan-bank-sampah.csv', ['Content-Type' => 'text/csv']);
        }
        $summary = ['credited' => (int) (clone $q)->where('kind', 'deposit')->sum('amount'), 'withdrawn' => -(int) (clone $q)->where('kind', 'withdrawal')->sum('amount'), 'reversed' => -(int) (clone $q)->where('kind', 'reversal')->sum('amount')];
        $weights = Deposit::where('status', 'verified')->whereDate('created_at', '>=', $from)->whereDate('created_at', '<=', $to)->selectRaw('category_name, SUM(weight_g) as weight_g, SUM(amount) as amount')->groupBy('category_name')->get();

        return Inertia::render('Reports', ['entries' => $q->latest()->paginate(30)->withQueryString(), 'summary' => $summary, 'weights' => $weights, 'filters' => compact('from', 'to')]);
    }

    private function safe(string $s): string
    {
        return preg_match('/^[\s=+@-]/u',$s) ? "'".$s : $s;
    }
}
