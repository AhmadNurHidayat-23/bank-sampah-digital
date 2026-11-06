import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
const pages = import.meta.glob<{ default: React.ComponentType }>(
    "./pages/*.tsx",
);
createInertiaApp({
    title: (t) => t + " — Sirkula",
    resolve: async (name) =>
        (await pages["./pages/" + name + ".tsx"]()).default,
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: { color: "#bf492e" },
});
