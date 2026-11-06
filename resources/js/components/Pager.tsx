import { Link } from "@inertiajs/react";
import type { Paginated } from "../types";
export default function Pager({
    page,
}: {
    page: Pick<
        Paginated<unknown>,
        "current_page" | "last_page" | "prev_page_url" | "next_page_url"
    >;
}) {
    return (
        <div className="pager">
            <span>
                Halaman {page.current_page} / {page.last_page}
            </span>
            <div>
                {page.prev_page_url && (
                    <Link
                        preserveState
                        preserveScroll
                        href={page.prev_page_url}
                    >
                        Sebelumnya
                    </Link>
                )}
                {page.next_page_url && (
                    <Link
                        preserveState
                        preserveScroll
                        href={page.next_page_url}
                    >
                        Berikutnya
                    </Link>
                )}
            </div>
        </div>
    );
}
