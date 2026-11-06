import { useForm } from "@inertiajs/react";
import { X } from "lucide-react";
import { useDialog } from "./useDialog";
export interface Review {
    url: string;
    action: string;
    title: string;
    description: string;
}
export default function ReviewDialog({
    review,
    onClose,
}: {
    review: Review;
    onClose: () => void;
}) {
    const dialog = useDialog(onClose);
    const f = useForm({ action: review.action, reason: "" });
    return (
        <div className="modal-backdrop">
            <section
                ref={dialog}
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="review-title"
            >
                <button
                    className="icon close"
                    aria-label="Tutup"
                    onClick={onClose}
                >
                    <X size={18} />
                </button>
                <span className="eyebrow">KONFIRMASI TRANSAKSI</span>
                <h2 id="review-title">{review.title}</h2>
                <p>{review.description}</p>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        f.patch(review.url, {
                            preserveScroll: true,
                            onSuccess: onClose,
                        });
                    }}
                >
                    <label>
                        Alasan / catatan petugas
                        <textarea
                            autoFocus
                            required
                            minLength={5}
                            maxLength={300}
                            rows={3}
                            value={f.data.reason}
                            onChange={(e) =>
                                f.setData("reason", e.target.value)
                            }
                        />
                    </label>
                    {Object.values(f.errors).map((e, i) => (
                        <p key={i} className="field-error" role="alert">
                            {e}
                        </p>
                    ))}
                    <button
                        className="btn primary full"
                        disabled={f.processing}
                    >
                        {f.processing
                            ? "Menyimpan…"
                            : "Konfirmasi dan catat audit"}
                    </button>
                </form>
            </section>
        </div>
    );
}
