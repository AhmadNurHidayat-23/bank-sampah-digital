import { useState } from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import { ArrowRight, Recycle, Leaf, Scale } from "lucide-react";
import Layout from "../components/Layout";
export default function Auth() {
    const [register, setRegister] = useState(false);
    const f = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });
    return (
        <Layout title="Sampah bernilai, langkah berarti">
            <section className="welcome">
                <div className="welcome-copy">
                    <span className="eyebrow">
                        EKONOMI SIRKULAR, DIMULAI DARI ANDA
                    </span>
                    <h1>
                        Bukan akhir.
                        <br />
                        Awal yang <em>lebih baik.</em>
                    </h1>
                    <p>
                        Botol yang dipilah. Kertas yang dikumpulkan. Ubah
                        kebiasaan sederhana menjadi tabungan yang bisa Anda
                        lihat perkembangannya.
                    </p>
                    <div className="process">
                        <div>
                            <Recycle />
                            <strong>Pilah</strong>
                            <small>Pisahkan sesuai jenis.</small>
                        </div>
                        <div>
                            <Scale />
                            <strong>Setor</strong>
                            <small>Timbang bersama petugas.</small>
                        </div>
                        <div>
                            <Leaf />
                            <strong>Tabung</strong>
                            <small>Saldo setelah verifikasi.</small>
                        </div>
                    </div>
                    <div className="material-strip">
                        <span>01 / PLASTIK</span>
                        <span>02 / KERTAS</span>
                        <span>03 / LOGAM</span>
                        <span>04 / KACA</span>
                    </div>
                </div>
                <div className="auth-panel">
                    {usePage().props.user ? (
                        <>
                            <h2>Selamat datang kembali.</h2>
                            <Link className="btn primary" href="/beranda">
                                Buka buku tabungan <ArrowRight size={16} />
                            </Link>
                        </>
                    ) : (
                        <>
                            <span className="eyebrow">
                                BERGABUNG DALAM PERUBAHAN
                            </span>
                            <h2>
                                {register
                                    ? "Mulai langkah pertama."
                                    : "Senang Anda kembali."}
                            </h2>
                            <p>
                                {register
                                    ? "Buat akun anggota untuk melihat setoran dan saldo Anda."
                                    : "Masuk untuk melihat tabungan atau mengelola setoran."}
                            </p>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    f.post(register ? "/daftar" : "/masuk", {
                                        onFinish: () =>
                                            f.reset(
                                                "password",
                                                "password_confirmation",
                                            ),
                                    });
                                }}
                            >
                                {register && (
                                    <label>
                                        Nama lengkap
                                        <input
                                            autoComplete="name"
                                            required
                                            maxLength={80}
                                            value={f.data.name}
                                            onChange={(e) =>
                                                f.setData(
                                                    "name",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </label>
                                )}
                                <label>
                                    Email
                                    <input
                                        autoComplete="username"
                                        required
                                        type="email"
                                        value={f.data.email}
                                        onChange={(e) =>
                                            f.setData("email", e.target.value)
                                        }
                                    />
                                </label>
                                <label>
                                    Kata sandi
                                    <input
                                        autoComplete={
                                            register
                                                ? "new-password"
                                                : "current-password"
                                        }
                                        required
                                        minLength={register ? 12 : 1}
                                        type="password"
                                        value={f.data.password}
                                        onChange={(e) =>
                                            f.setData(
                                                "password",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </label>
                                {register && (
                                    <label>
                                        Ulangi kata sandi
                                        <input
                                            autoComplete="new-password"
                                            required
                                            minLength={12}
                                            type="password"
                                            value={f.data.password_confirmation}
                                            onChange={(e) =>
                                                f.setData(
                                                    "password_confirmation",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </label>
                                )}
                                <button
                                    className="btn primary full"
                                    disabled={f.processing}
                                >
                                    {f.processing
                                        ? "Memproses…"
                                        : register
                                          ? "Daftar sebagai anggota"
                                          : "Masuk ke akun"}
                                    <ArrowRight size={16} />
                                </button>
                            </form>
                            <button
                                className="text-btn"
                                onClick={() => {
                                    setRegister(!register);
                                    f.clearErrors();
                                }}
                            >
                                {register
                                    ? "Sudah punya akun? Masuk"
                                    : "Belum punya akun? Daftar anggota"}
                            </button>
                            <small>
                                Data tabungan hanya dapat dilihat oleh Anda dan
                                petugas yang berwenang.
                            </small>
                        </>
                    )}
                </div>
            </section>
        </Layout>
    );
}
