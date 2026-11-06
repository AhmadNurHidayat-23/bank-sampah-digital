import { useEffect, useRef } from "react";
export function useDialog(onClose: () => void) {
    const ref = useRef<HTMLElement>(null);
    useEffect(() => {
        const previous = document.activeElement as HTMLElement | null;
        const bodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const dialog = ref.current;
        const query =
            'button:not(:disabled),input:not(:disabled),select,textarea,a[href],[tabindex="0"]';
        const first = dialog?.querySelector<HTMLElement>(query);
        first?.focus();
        function handle(e: KeyboardEvent) {
            if (e.key === "Escape") {
                onClose();
                return;
            }
            if (e.key !== "Tab" || !dialog) return;
            const focusable = Array.from(
                dialog.querySelectorAll<HTMLElement>(query),
            );
            const first = focusable[0],
                last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first?.focus();
            }
        }
        document.addEventListener("keydown", handle);
        return () => {
            document.removeEventListener("keydown", handle);
            document.body.style.overflow = bodyOverflow;
            previous?.focus();
        };
    }, [onClose]);
    return ref;
}
