import { Head, Link, router, usePage } from "@inertiajs/react";
import { Recycle, LogOut, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import type { User } from "../types";
export default function Layout({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    const p = usePage().props;
    const user = p.user as User | null;
    const flash = p.flash as { success?: string };
    const errors = p.errors as Record<string, string>;
    return (
        <>
            <Head title={title} />
            <header>
                <Link className="brand" href={user ? "/beranda" : "/"}>
                    <Recycle />
                    <span>
                        sirkula<span>BANK SAMPAH DIGITAL</span>
                    </span>
                </Link>
                <nav>
                    {user ? (
                        <>
                            <Link href="/beranda">Buku tabungan</Link>
                            {user.role === "staff" && (
                                <Link href="/petugas/laporan">Laporan</Link>
                            )}
                            <span className="identity">
                                {user.name} ·{" "}
                                {user.role === "staff" ? "Petugas" : "Anggota"}
                            </span>
                            <button
                                aria-label="Keluar"
                                className="icon"
                                onClick={() => router.post("/keluar")}
                            >
                                <LogOut size={17} />
                            </button>
                        </>
                    ) : (
                        <>
                            <span>Hal kecil. Dampak berarti.</span>
                            <Link href="/masuk">
                                Masuk <ArrowUpRight size={15} />
                            </Link>
                        </>
                    )}
                </nav>
            </header>
            {flash?.success && (
                <div role="status" className="notice success">
                    {flash.success}
                </div>
            )}
            {Object.values(errors || {}).length > 0 && (
                <div className="notice error" role="alert">
                    {Object.values(errors).map((e, i) => (
                        <p key={i}>{e}</p>
                    ))}
                </div>
            )}
            <main>{children}</main>
            <footer>
                <strong>sirkula.</strong>
                <span>Pilah dengan sadar. Setor dengan mudah.</span>
                <small>
                    Saldo berasal dari transaksi terverifikasi · Penarikan tunai
                    manual
                </small>
            </footer>
        </>
    );
}
