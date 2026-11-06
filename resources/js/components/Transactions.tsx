import { useState } from "react";
import {
    money,
    date,
    statuses,
    type Deposit,
    type Withdrawal,
    type Entry,
    type Paginated,
} from "../types";
import Pager from "./Pager";
import type { Review } from "./ReviewDialog";
export function Deposits({
    page,
    staff,
    onReview,
}: {
    page: Paginated<Deposit>;
    staff: boolean;
    onReview: (r: Review) => void;
}) {
    return (
        <>
            <div className="table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th>Setoran / waktu</th>
                            <th>Anggota</th>
                            <th>Berat × harga</th>
                            <th>Nilai</th>
                            <th>Status</th>
                            {staff && <th>Tindakan</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {page.data.map((d) => (
                            <tr key={d.id}>
                                <td>
                                    <strong>
                                        #{d.id} · {d.category_name}
                                    </strong>
                                    <small>{date(d.created_at)}</small>
                                    {d.note && <small>{d.note}</small>}
                                </td>
                                <td>{d.user.name}</td>
                                <td>
                                    {d.weight_g / 1000} kg
                                    <small>{money(d.price)}/kg</small>
                                </td>
                                <td>{money(d.amount)}</td>
                                <td>
                                    <span className={"badge " + d.status}>
                                        {statuses[d.status]}
                                    </span>
                                </td>
                                {staff && (
                                    <td>
                                        <div className="row-actions">
                                            {(d.status === "pending"
                                                ? ["verify", "reject"]
                                                : d.status === "verified"
                                                  ? ["void"]
                                                  : []
                                            ).map((a) => (
                                                <button
                                                    key={a}
                                                    className="btn small secondary"
                                                    onClick={() =>
                                                        onReview({
                                                            url:
                                                                "/petugas/setoran/" +
                                                                d.id,
                                                            action: a,
                                                            title:
                                                                a === "verify"
                                                                    ? "Verifikasi setoran"
                                                                    : a ===
                                                                        "reject"
                                                                      ? "Tolak setoran"
                                                                      : "Balikkan setoran",
                                                            description:
                                                                (a === "verify"
                                                                    ? "Saldo akan bertambah "
                                                                    : a ===
                                                                        "void"
                                                                      ? "Saldo akan dikurangi "
                                                                      : "Setoran tidak akan masuk saldo. Nilai: ") +
                                                                money(
                                                                    d.amount,
                                                                ) +
                                                                " untuk " +
                                                                d.user.name +
                                                                ".",
                                                        })
                                                    }
                                                >
                                                    {a === "verify"
                                                        ? "Verifikasi"
                                                        : a === "reject"
                                                          ? "Tolak"
                                                          : "Batalkan"}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!page.data.length && (
                    <div className="empty">
                        <h3>Belum ada setoran.</h3>
                        <p>Setoran yang dicatat petugas akan muncul di sini.</p>
                    </div>
                )}
            </div>
            <Pager page={page} />
        </>
    );
}
export function Withdrawals({
    page,
    staff,
    onReview,
}: {
    page: Paginated<Withdrawal>;
    staff: boolean;
    onReview: (r: Review) => void;
}) {
    return (
        <>
            <div className="table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th>Pengajuan</th>
                            <th>Anggota</th>
                            <th>Nominal</th>
                            <th>Status</th>
                            <th>Catatan</th>
                            {staff && <th>Tindakan</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {page.data.map((d) => (
                            <tr key={d.id}>
                                <td>
                                    #{d.id}
                                    <small>{date(d.created_at)}</small>
                                </td>
                                <td>{d.user.name}</td>
                                <td>{money(d.amount)}</td>
                                <td>
                                    <span className={"badge " + d.status}>
                                        {statuses[d.status]}
                                    </span>
                                </td>
                                <td className="wrap">{d.note || "—"}</td>
                                {staff && (
                                    <td>
                                        {d.status === "pending" && (
                                            <div className="row-actions">
                                                {["approve", "reject"].map(
                                                    (a) => (
                                                        <button
                                                            key={a}
                                                            className="btn small secondary"
                                                            onClick={() =>
                                                                onReview({
                                                                    url:
                                                                        "/petugas/penarikan/" +
                                                                        d.id,
                                                                    action: a,
                                                                    title:
                                                                        a ===
                                                                        "approve"
                                                                            ? "Konfirmasi penyerahan tunai"
                                                                            : "Tolak penarikan",
                                                                    description:
                                                                        a ===
                                                                        "approve"
                                                                            ? "Pastikan " +
                                                                              money(
                                                                                  d.amount,
                                                                              ) +
                                                                              " benar-benar diserahkan kepada " +
                                                                              d
                                                                                  .user
                                                                                  .name +
                                                                              ". Ini pencatatan tunai manual."
                                                                            : "Saldo yang ditahan akan tersedia kembali.",
                                                                })
                                                            }
                                                        >
                                                            {a === "approve"
                                                                ? "Konfirmasi tunai"
                                                                : "Tolak"}
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!page.data.length && (
                    <div className="empty">
                        <h3>Belum ada pengajuan.</h3>
                        <p>
                            Penarikan yang diajukan anggota akan tercatat di
                            sini.
                        </p>
                    </div>
                )}
            </div>
            <Pager page={page} />
        </>
    );
}
export function Ledger({
    page,
    staff,
}: {
    page: Paginated<Entry>;
    staff: boolean;
}) {
    return (
        <>
            <div className="table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th>Waktu</th>
                            {staff && <th>Anggota</th>}
                            <th>Keterangan</th>
                            <th>Mutasi</th>
                            <th>Saldo setelah</th>
                        </tr>
                    </thead>
                    <tbody>
                        {page.data.map((e) => (
                            <tr key={e.id}>
                                <td>{date(e.created_at)}</td>
                                {staff && <td>{e.user.name}</td>}
                                <td>{e.description}</td>
                                <td
                                    className={
                                        e.amount > 0 ? "positive" : "negative"
                                    }
                                >
                                    {e.amount > 0 ? "+" : ""}
                                    {money(e.amount)}
                                </td>
                                <td>{money(e.balance_after)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!page.data.length && (
                    <div className="empty">
                        <h3>Buku tabungan siap diisi.</h3>
                        <p>
                            Transaksi terverifikasi akan membentuk riwayat saldo
                            Anda.
                        </p>
                    </div>
                )}
            </div>
            <Pager page={page} />
        </>
    );
}
