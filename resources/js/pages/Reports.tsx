import { useState } from "react";
import { router } from "@inertiajs/react";
import { Download } from "lucide-react";
import Layout from "../components/Layout";
import { Ledger } from "../components/Transactions";
import { money, type Entry, type Paginated } from "../types";
export default function Reports({
    entries,
    summary,
    weights,
    filters,
}: {
    entries: Paginated<Entry>;
    summary: { credited: number; withdrawn: number; reversed: number };
    weights: { category_name: string; weight_g: number; amount: number }[];
    filters: { from: string; to: string };
}) {
    const [f, setF] = useState(filters);
    return (
        <Layout title="Laporan setoran & keuangan">
            <section className="workspace">
                <div className="section-title">
                    <div>
                        <span className="eyebrow">
                            LAPORAN / TRANSAKSI VALID
                        </span>
                        <h1>Angka yang bisa ditelusuri.</h1>
                        <p>
                            Keuangan berdasarkan tanggal mutasi; berat
                            berdasarkan tanggal setoran yang masih valid.
                        </p>
                    </div>
                    <a
                        className="btn secondary"
                        href={
                            "/petugas/laporan?" +
                            new URLSearchParams(filters) +
                            "&export=csv"
                        }
                    >
                        <Download size={16} />
                        Ekspor CSV
                    </a>
                </div>
                <form
                    className="filters"
                    onSubmit={(e) => {
                        e.preventDefault();
                        router.get("/petugas/laporan", f);
                    }}
                >
                    <label>
                        Dari tanggal
                        <input
                            type="date"
                            required
                            value={f.from}
                            onChange={(e) =>
                                setF({ ...f, from: e.target.value })
                            }
                        />
                    </label>
                    <label>
                        Sampai tanggal
                        <input
                            type="date"
                            required
                            min={f.from}
                            value={f.to}
                            onChange={(e) => setF({ ...f, to: e.target.value })}
                        />
                    </label>
                    <button className="btn primary">Terapkan</button>
                </form>
                <div className="report-stats">
                    {[
                        ["Setoran dikreditkan", summary.credited],
                        ["Penarikan tunai", summary.withdrawn],
                        ["Pembalikan setoran", summary.reversed],
                    ].map(([t, n]) => (
                        <div key={t}>
                            <span>{t}</span>
                            <strong>{money(Number(n))}</strong>
                        </div>
                    ))}
                </div>
                <div className="weight-summary">
                    {weights.map((w) => (
                        <div key={w.category_name}>
                            <strong>{w.category_name}</strong>
                            <span>{Number(w.weight_g) / 1000} kg</span>
                            <small>{money(Number(w.amount))}</small>
                        </div>
                    ))}
                </div>
                <Ledger page={entries} staff />
            </section>
        </Layout>
    );
}
