import { useState } from "react";
import { usePage } from "@inertiajs/react";
import {
    ArrowDownLeft,
    Wallet,
    Scale,
    Users,
    Clock,
    Search,
} from "lucide-react";
import Layout from "../components/Layout";
import DepositForm from "../components/DepositForm";
import WithdrawForm from "../components/WithdrawForm";
import ReviewDialog, { type Review } from "../components/ReviewDialog";
import CategoryEditor from "../components/CategoryEditor";
import { Deposits, Withdrawals, Ledger } from "../components/Transactions";
import {
    money,
    date,
    type User,
    type Category,
    type Deposit,
    type Withdrawal,
    type Entry,
    type Paginated,
} from "../types";
interface Props {
    categories: Category[];
    members: User[];
    deposits: Paginated<Deposit>;
    withdrawals: Paginated<Withdrawal>;
    entries: Paginated<Entry>;
    available: number;
    summary: {
        members: number | null;
        liability: number;
        pendingDeposits: number;
        weight: number;
    };
    audits: {
        id: number;
        actor: { name: string };
        subject: string;
        action: string;
        details: Record<string, unknown>;
        created_at: string;
    }[];
}
export default function Bank(p: Props) {
    const user = usePage().props.user as User;
    const staff = user.role === "staff";
    const [tab, setTab] = useState(staff ? "setoran" : "mutasi");
    const [review, setReview] = useState<Review | null>(null);
    const [search, setSearch] = useState("");
    const tabs = staff
        ? ["setoran", "penarikan", "mutasi", "kategori", "anggota", "audit"]
        : ["mutasi", "setoran", "penarikan", "kategori"];
    return (
        <Layout title="Buku tabungan">
            <section className="workspace">
                <div className="section-title">
                    <div>
                        <span className="eyebrow">
                            {staff ? "RUANG PETUGAS" : "TABUNGAN ANDA"}
                        </span>
                        <h1>
                            {staff
                                ? "Setoran tertib. Manfaat nyata."
                                : "Satu setoran, satu perubahan."}
                        </h1>
                        <p>
                            {staff
                                ? "Catat timbangan, verifikasi nilai, dan jaga setiap rupiah anggota."
                                : "Halo, " +
                                  user.name +
                                  ". Lihat hasil kebiasaan baik Anda di sini."}
                        </p>
                    </div>
                    <span className="date-stamp">
                        PENCATATAN TERVERIFIKASI
                        <ArrowDownLeft size={25} />
                    </span>
                </div>
                <div className="overview">
                    <div className="balance">
                        <span>
                            <Wallet size={17} />
                            {staff ? "Total saldo anggota" : "Saldo tercatat"}
                        </span>
                        <strong>{money(p.summary.liability)}</strong>
                        <small>
                            {staff
                                ? "Kewajiban bank sampah kepada seluruh anggota."
                                : "Tersedia untuk ditarik: " +
                                  money(p.available)}
                        </small>
                    </div>
                    <div>
                        <Scale />
                        <strong>
                            {(Number(p.summary.weight) / 1000).toLocaleString(
                                "id-ID",
                            )}{" "}
                            kg
                        </strong>
                        <small>Setoran terverifikasi</small>
                    </div>
                    <div>
                        <Clock />
                        <strong>{p.summary.pendingDeposits}</strong>
                        <small>Setoran menunggu verifikasi</small>
                    </div>
                    {staff && (
                        <div>
                            <Users />
                            <strong>{p.summary.members}</strong>
                            <small>Anggota terdaftar</small>
                        </div>
                    )}
                </div>
                <div
                    className="tabs"
                    role="group"
                    aria-label="Bagian buku tabungan"
                >
                    {tabs.map((t) => (
                        <button
                            key={t}
                            className={tab === t ? "active" : ""}
                            onClick={() => setTab(t)}
                        >
                            {
                                (
                                    {
                                        setoran: "Setoran",
                                        penarikan: "Penarikan",
                                        mutasi: "Mutasi saldo",
                                        kategori: "Kategori & harga",
                                        anggota: "Anggota",
                                        audit: "Jejak audit",
                                    } as Record<string, string>
                                )[t]
                            }
                        </button>
                    ))}
                </div>
                {tab === "setoran" && (
                    <>
                        {staff && (
                            <DepositForm
                                categories={p.categories}
                                members={p.members}
                            />
                        )}
                        <Deposits
                            page={p.deposits}
                            staff={staff}
                            onReview={setReview}
                        />
                    </>
                )}
                {tab === "penarikan" && (
                    <>
                        {!staff && <WithdrawForm available={p.available} />}
                        <Withdrawals
                            page={p.withdrawals}
                            staff={staff}
                            onReview={setReview}
                        />
                    </>
                )}
                {tab === "mutasi" && <Ledger page={p.entries} staff={staff} />}
                {tab === "kategori" && (
                    <CategoryEditor categories={p.categories} staff={staff} />
                )}
                {tab === "anggota" && staff && (
                    <>
                        <label className="member-search">
                            <Search size={16} />
                            <input
                                aria-label="Cari anggota"
                                placeholder="Cari nama atau email anggota"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </label>
                        <div className="table-scroll">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Anggota</th>
                                        <th>Email</th>
                                        <th>Saldo tercatat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {p.members
                                        .filter((m) =>
                                            (m.name + " " + m.email)
                                                .toLowerCase()
                                                .includes(search.toLowerCase()),
                                        )
                                        .map((m) => (
                                            <tr key={m.id}>
                                                <td>{m.name}</td>
                                                <td>{m.email}</td>
                                                <td>{money(m.balance)}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                            {!p.members.length && (
                                <div className="empty">
                                    Belum ada anggota terdaftar.
                                </div>
                            )}
                        </div>
                    </>
                )}
                {tab === "audit" && staff && (
                    <div className="audit-list">
                        <p className="hint">
                            30 aktivitas terakhir. Catatan lama tetap tersimpan
                            di database.
                        </p>
                        {p.audits.map((a) => (
                            <article key={a.id}>
                                <div>
                                    <span className="eyebrow">{a.subject}</span>
                                    <h3>{a.action}</h3>
                                    <small>
                                        {a.actor.name} · {date(a.created_at)}
                                    </small>
                                </div>
                                <pre>{JSON.stringify(a.details, null, 2)}</pre>
                            </article>
                        ))}
                        {!p.audits.length && (
                            <div className="empty">
                                Belum ada aktivitas petugas.
                            </div>
                        )}
                    </div>
                )}
                {review && (
                    <ReviewDialog
                        key={review.url + review.action}
                        review={review}
                        onClose={() => setReview(null)}
                    />
                )}
            </section>
        </Layout>
    );
}
