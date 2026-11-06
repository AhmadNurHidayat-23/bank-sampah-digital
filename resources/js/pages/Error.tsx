import { Link } from "@inertiajs/react";
import Layout from "../components/Layout";
export default function Error({ status }: { status: number }) {
    return (
        <Layout title={String(status)}>
            <section className="empty">
                <span className="eyebrow">{status}</span>
                <h1>
                    {status === 403
                        ? "Akses ini terbatas."
                        : status === 419
                          ? "Sesi telah berakhir."
                          : status === 429
                            ? "Tunggu sebentar."
                            : "Halaman belum dapat dibuka."}
                </h1>
                <p>Periksa tautan atau masuk kembali sebelum melanjutkan.</p>
                <Link className="btn primary" href="/beranda">
                    Kembali ke tabungan
                </Link>
            </section>
        </Layout>
    );
}
