import { defineConfig } from "@playwright/test";
export default defineConfig({
    testDir: "tests/browser",
    workers: 1,
    retries: 0,
    timeout: 90000,
    expect: { timeout: 10000 },
    use: {
        baseURL: "http://127.0.0.1:8022",
        channel: "msedge",
        headless: true,
        trace: "retain-on-failure",
    },
    reporter: "list",
    webServer: {
        command: "php artisan serve --host=127.0.0.1 --port=8022 --no-reload",
        url: "http://127.0.0.1:8022/up",
        reuseExistingServer: false,
        timeout: 30000,
    },
});
