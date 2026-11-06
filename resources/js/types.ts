export interface User {
    id: number;
    name: string;
    email: string;
    balance: number;
    role: "staff" | "member";
}
export interface Category {
    id: number;
    name: string;
    description: string;
    price: number;
    active: boolean;
}
export interface Deposit {
    id: number;
    user: { id: number; name: string };
    category_name: string;
    weight_g: number;
    price: number;
    amount: number;
    status: string;
    note: string | null;
    created_at: string;
}
export interface Withdrawal {
    id: number;
    user: { id: number; name: string };
    amount: number;
    status: string;
    note: string | null;
    created_at: string;
}
export interface Entry {
    id: number;
    user: { id: number; name: string };
    kind: string;
    description: string;
    amount: number;
    balance_after: number;
    created_at: string;
}
export interface Paginated<T> {
    data: T[];
    prev_page_url: string | null;
    next_page_url: string | null;
    current_page: number;
    last_page: number;
}
export const money = (n: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(n);
export const date = (s: string) =>
    new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(s));
export const statuses: Record<string, string> = {
    pending: "Menunggu",
    verified: "Terverifikasi",
    rejected: "Ditolak",
    voided: "Dibatalkan",
    paid: "Tunai diserahkan",
};
