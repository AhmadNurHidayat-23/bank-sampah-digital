import { useState } from "react";
import { useForm } from "@inertiajs/react";
import { X, Plus } from "lucide-react";
import { money, type Category } from "../types";
import { useDialog } from "./useDialog";
function Editor({
    category,
    onClose,
}: {
    category: Category | null;
    onClose: () => void;
}) {
    const dialog = useDialog(onClose);
    const f = useForm({
        name: category?.name || "",
        description: category?.description || "",
        price: category?.price || 1000,
        active: category?.active ?? true,
    });
    return (
        <div className="modal-backdrop">
            <section
                ref={dialog}
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-label="Editor kategori"
            >
                <button
                    className="icon close"
                    aria-label="Tutup"
                    onClick={onClose}
                >
                    <X size={18} />
                </button>
                <h2>{category ? "Edit kategori" : "Kategori baru"}</h2>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        f.post(
                            "/petugas/kategori" +
                                (category ? "/" + category.id : ""),
                            { preserveScroll: true, onSuccess: onClose },
                        );
                    }}
                >
                    <label>
                        Nama kategori
                        <input
                            required
                            maxLength={60}
                            value={f.data.name}
                            onChange={(e) => f.setData("name", e.target.value)}
                        />
                    </label>
                    <label>
                        Panduan pemilahan
                        <textarea
                            required
                            maxLength={200}
                            value={f.data.description}
                            onChange={(e) =>
                                f.setData("description", e.target.value)
                            }
                        />
                    </label>
                    <label>
                        Harga per kilogram (Rp)
                        <input
                            type="number"
                            min={100}
                            max={500000}
                            required
                            value={f.data.price}
                            onChange={(e) =>
                                f.setData("price", Number(e.target.value))
                            }
                        />
                    </label>
                    <label className="checkbox">
                        <input
                            type="checkbox"
                            checked={f.data.active}
                            onChange={(e) =>
                                f.setData("active", e.target.checked)
                            }
                        />
                        Aktif menerima setoran
                    </label>
                    <small>
                        Harga baru berlaku untuk pencatatan setoran berikutnya.
                    </small>
                    {Object.values(f.errors).map((e, i) => (
                        <p className="field-error" key={i}>
                            {e}
                        </p>
                    ))}
                    <button
                        className="btn primary full"
                        disabled={f.processing}
                    >
                        Simpan kategori
                    </button>
                </form>
            </section>
        </div>
    );
}
export default function CategoryEditor({
    categories,
    staff,
}: {
    categories: Category[];
    staff: boolean;
}) {
    const [edit, setEdit] = useState<Category | null | undefined>();
    return (
        <>
            <div className="section-title">
                <h2>Jenis yang kami terima.</h2>
                {staff && (
                    <button
                        className="btn secondary"
                        onClick={() => setEdit(null)}
                    >
                        <Plus size={15} />
                        Kategori baru
                    </button>
                )}
            </div>
            <div className="categories">
                {categories
                    .filter((c) => staff || c.active)
                    .map((c, i) => (
                        <article key={c.id}>
                            <span className="eyebrow">
                                {String(i + 1).padStart(2, "0")} /{" "}
                                {c.active ? "DITERIMA" : "NONAKTIF"}
                            </span>
                            <h3>{c.name}</h3>
                            <p>{c.description}</p>
                            <strong>
                                {money(c.price)} <small>/ kilogram</small>
                            </strong>
                            {staff && (
                                <button
                                    className="text-btn"
                                    onClick={() => setEdit(c)}
                                >
                                    Ubah kategori
                                </button>
                            )}
                        </article>
                    ))}
            </div>
            {!categories.length && (
                <div className="empty">Belum ada kategori sampah.</div>
            )}
            {edit !== undefined && (
                <Editor category={edit} onClose={() => setEdit(undefined)} />
            )}
        </>
    );
}
