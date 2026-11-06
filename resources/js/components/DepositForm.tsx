import { useForm } from "@inertiajs/react";
import { Scale } from "lucide-react";
import { money, type Category, type User } from "../types";
export default function DepositForm({
    categories,
    members,
}: {
    categories: Category[];
    members: User[];
}) {
    const f = useForm({
        user_id: "",
        category_id: "",
        weight_kg: "",
        note: "",
    });
    const c = categories.find((c) => String(c.id) === f.data.category_id);
    const grams = Math.round(Number(f.data.weight_kg || 0) * 1000);
    const estimate = c ? Math.floor((c.price * grams + 500) / 1000) : 0;
    return (
        <section className="panel">
            <span className="eyebrow">CATAT SETORAN BARU</span>
            <h2>
                <Scale size={22} /> Dari timbangan ke tabungan.
            </h2>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    f.post("/petugas/setoran", {
                        preserveScroll: true,
                        onSuccess: () => f.reset(),
                    });
                }}
            >
                <div className="form-grid">
                    <label>
                        Anggota
                        <select
                            aria-label="Anggota"
                            required
                            value={f.data.user_id}
                            onChange={(e) =>
                                f.setData("user_id", e.target.value)
                            }
                        >
                            <option value="">Pilih anggota</option>
                            {members.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name} · {m.email}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Jenis sampah
                        <select
                            aria-label="Jenis sampah"
                            required
                            value={f.data.category_id}
                            onChange={(e) =>
                                f.setData("category_id", e.target.value)
                            }
                        >
                            <option value="">Pilih kategori</option>
                            {categories
                                .filter((c) => c.active)
                                .map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} · {money(c.price)}/kg
                                    </option>
                                ))}
                        </select>
                    </label>
                    <label>
                        Berat (kg)
                        <input
                            type="number"
                            step="0.001"
                            min="0.001"
                            max="1000"
                            required
                            placeholder="Contoh: 2.500"
                            value={f.data.weight_kg}
                            onChange={(e) =>
                                f.setData("weight_kg", e.target.value)
                            }
                        />
                    </label>
                    <label>
                        Catatan pemeriksaan
                        <input
                            maxLength={300}
                            value={f.data.note}
                            onChange={(e) => f.setData("note", e.target.value)}
                        />
                    </label>
                </div>
                <div className="form-bottom">
                    <div>
                        <small>Nilai setoran</small>
                        <strong>{money(estimate)}</strong>
                        <small>Belum masuk saldo sebelum diverifikasi.</small>
                    </div>
                    <button
                        className="btn primary"
                        disabled={f.processing || !members.length}
                    >
                        {f.processing ? "Mencatat…" : "Catat setoran"}
                    </button>
                </div>
                {!members.length && (
                    <p className="hint">
                        Belum ada anggota. Calon anggota dapat mendaftar melalui
                        halaman masuk.
                    </p>
                )}
            </form>
        </section>
    );
}
