import { test, expect, type Page } from "@playwright/test";
async function login(p: Page, email: string) {
    await p.goto("/masuk");
    await p.getByLabel("Email", { exact: true }).fill(email);
    await p
        .getByLabel("Kata sandi", { exact: true })
        .fill(process.env.E2E_PASSWORD!);
    await p.getByRole("button", { name: "Masuk ke akun" }).click();
    await expect(p).toHaveURL(/beranda/);
}
async function noOverflow(p: Page) {
    expect(
        await p.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
    ).toBe(true);
}
test("Registrasi, setoran, verifikasi, reservasi saldo, tunai, laporan", async ({
    page,
    browser,
}) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await page
        .getByRole("button", { name: "Belum punya akun? Daftar anggota" })
        .click();
    await page.getByLabel("Nama lengkap").fill("Anggota Browser");
    await page
        .getByLabel("Email", { exact: true })
        .fill("anggota@example.test");
    await page
        .getByLabel("Kata sandi", { exact: true })
        .fill(process.env.E2E_PASSWORD!);
    await page.getByLabel("Ulangi kata sandi").fill(process.env.E2E_PASSWORD!);
    await page.getByRole("button", { name: "Daftar sebagai anggota" }).click();
    await expect(page).toHaveURL(/beranda/);
    const context = await browser.newContext();
    const staff = await context.newPage();
    staff.on("pageerror", (e) => errors.push(e.message));
    await login(staff, "petugas@example.test");
    await staff
        .getByLabel("Anggota", { exact: true })
        .selectOption({ label: "Anggota Browser · anggota@example.test" });
    const categoryValue=await staff.getByLabel('Jenis sampah').locator('option').filter({hasText:'Plastik PET'}).getAttribute('value');
    await staff.getByLabel('Jenis sampah').selectOption(categoryValue!);
    await staff.getByLabel("Berat (kg)").fill("2.500");
    await staff
        .getByRole("button", { name: "Catat setoran", exact: true })
        .click();
    const deposit = staff
        .locator("tbody tr")
        .filter({ hasText: "Plastik PET" });
    await expect(deposit).toContainText("8.750");
    await expect(deposit).toContainText("Menunggu");
    await page.reload();
    await expect(page.locator(".balance")).toContainText("Rp 0");
    await staff
        .getByRole("button", { name: "Verifikasi", exact: true })
        .click();
    await staff
        .getByLabel("Alasan / catatan petugas")
        .fill("Timbangan sesuai pemeriksaan");
    await staff
        .getByRole("button", { name: "Konfirmasi dan catat audit" })
        .click();
    await expect(deposit).toContainText("Terverifikasi");
    await page.reload();
    await expect(page.locator(".balance")).toContainText("8.750");
    await page.getByRole("button", { name: "Penarikan", exact: true }).click();
    await page.getByLabel("Nominal penarikan (Rp)").fill("5000");
    await page
        .getByRole("button", { name: "Ajukan penarikan", exact: true })
        .click();
    await expect(page.locator(".balance")).toContainText("3.750");
    await staff.reload();
    await staff.getByRole("button", { name: "Penarikan", exact: true }).click();
    await staff
        .getByRole("button", { name: "Konfirmasi tunai", exact: true })
        .click();
    await staff
        .getByLabel("Alasan / catatan petugas")
        .fill("Tunai diserahkan dan diterima anggota");
    await staff
        .getByRole("button", { name: "Konfirmasi dan catat audit" })
        .click();
    await expect(staff.locator("tbody")).toContainText("Tunai diserahkan");
    await page.reload();
    await expect(page.locator(".balance strong")).toContainText("3.750");
    await expect(page.locator(".balance small")).toContainText("3.750");
    await staff.getByRole("link", { name: "Laporan", exact: true }).click();
    await expect(staff.locator(".report-stats")).toContainText("8.750");
    await expect(staff.locator(".report-stats")).toContainText("5.000");
    const download = staff.waitForEvent("download");
    await staff.getByRole("link", { name: "Ekspor CSV" }).click();
    expect((await download).suggestedFilename()).toBe(
        "laporan-bank-sampah.csv",
    );
    await staff
        .getByRole("link", { name: "Buku tabungan", exact: true })
        .click();
    await staff
        .getByRole("button", { name: "Kategori & harga", exact: true })
        .click();
    await staff
        .locator(".categories article")
        .filter({ hasText: "Plastik PET" })
        .getByRole("button", { name: "Ubah kategori" })
        .click();
    await staff.getByLabel("Harga per kilogram (Rp)").fill("4000");
    await staff.getByRole("button", { name: "Simpan kategori" }).click();
    await expect(staff.locator(".categories")).toContainText("4.000");
    await staff
        .getByRole("button", { name: "Jejak audit", exact: true })
        .click();
    await expect(staff.locator(".audit-list")).toContainText(
        "Harga/kategori diperbarui",
    );
    for (const width of [1440, 768, 390]) {
        await page.setViewportSize({ width, height: 900 });
        await page
            .getByRole("button", { name: "Mutasi saldo", exact: true })
            .click();
        await noOverflow(page);
        await page.screenshot({
            path: "test-results/member-" + width + ".png",
            fullPage: true,
        });
        await staff.setViewportSize({ width, height: 900 });
        await staff
            .getByRole("button", { name: "Setoran", exact: true })
            .click();
        await noOverflow(staff);
    }
    const denied = await page.goto("/petugas/laporan");
    expect(denied?.status()).toBe(403);
    expect(errors).toEqual([]);
    await context.close();
});
test("Halaman publik tampil responsif", async ({ page }) => {
    for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/");
        await expect(
            page.getByRole("heading", {
                name: "Bukan akhir. Awal yang lebih baik.",
            }),
        ).toBeVisible();
        await noOverflow(page);
        await page.screenshot({
            path: "test-results/landing-" + width + ".png",
            fullPage: true,
        });
    }
});

