import { useForm } from "@inertiajs/react";
import { money } from "../types";
export default function WithdrawForm({ available }: { available: number }) {
    const f = useForm({ amount: "" });
    return (
        <section className="panel withdraw">
            <div>
                <span className="eyebrow">AMBIL MANFAATNYA</span>
                <h2>Ajukan penarikan.</h2>
                <p>
                    Saldo tersedia {money(available)}. Dana pengajuan akan
                    ditahan hingga petugas menyetujui atau menolak.
                </p>
            </div>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    f.post("/penarikan", {
                        preserveScroll: true,
                        onSuccess: () => f.reset(),
                    });
                }}
            >
                <label>
                    Nominal penarikan (Rp)
                    <input
                        type="number"
                        required
                        min={1000}
                        max={available}
                        step={1}
                        value={f.data.amount}
                        onChange={(e) => f.setData("amount", e.target.value)}
                    />
                </label>
                <button
                    className="btn primary"
                    disabled={available < 1000 || f.processing}
                >
                    {f.processing ? "Mengajukan…" : "Ajukan penarikan"}
                </button>
            </form>
        </section>
    );
}
