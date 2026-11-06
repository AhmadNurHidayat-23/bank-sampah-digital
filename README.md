# Bank Sampah Digital

**Sirkula** membantu bank sampah mencatat timbangan, memverifikasi setoran, mengelola tabungan anggota, dan mencatat penyerahan tunai secara tertib.

## Fitur

- Registrasi dan login anggota; akun petugas dibuat lewat perintah khusus.
- Kategori sampah, panduan pemilahan, harga per kilogram, dan aktivasi kategori.
- Pencatatan berat hingga tiga desimal kilogram. Backend menggunakan gram dan rupiah bulat; nilai dibulatkan ke rupiah terdekat.
- Setoran berstatus menunggu tidak menambah saldo. Verifikasi hanya dapat dilakukan satu kali.
- Harga transaksi tersimpan saat pencatatan; perubahan tarif tidak mengubah setoran lama.
- Mutasi saldo tetap tersimpan. Pembatalan setoran terverifikasi membuat transaksi pembalik dengan alasan petugas.
- Pengajuan penarikan menahan saldo tersedia. Persetujuan mengurangi saldo satu kali; penolakan melepas penahanan.
- Pencatatan penyerahan tunai manual, riwayat anggota, jejak audit, dan laporan keuangan/setoran dengan ekspor CSV.
- Antarmuka bahasa Indonesia dengan keadaan kosong, sukses, error, loading, dialog keyboard, dan tampilan responsif.

## Teknologi

Laravel 13, PHP 8.3+, React 19, TypeScript, Inertia.js 3, Tailwind CSS 4, Vite 7, SQLite, PHPUnit, dan Playwright. Gunakan Node.js 22.12+; dependensi dikunci melalui lockfile.

## Instalasi dan menjalankan

```powershell
composer install
Copy-Item .env.example .env
php artisan key:generate
New-Item -ItemType File database/database.sqlite -ErrorAction SilentlyContinue
php artisan migrate --seed
npm ci
npm run build
php artisan staff:create
php artisan serve --host=127.0.0.1 --port=8021
```

Buka `http://127.0.0.1:8021`. Anggota dapat mendaftar langsung. Perintah `staff:create` meminta nama, email, dan kata sandi minimal 12 karakter melalui input interaktif. Tidak ada akun/password bawaan. Seeder hanya membuat empat kategori contoh; tidak membuat saldo atau transaksi fiktif. Untuk pengembangan frontend, jalankan `npm run dev` di terminal terpisah.

Database khusus aplikasi tersimpan di `database/database.sqlite` dan diabaikan Git. Jika memakai MySQL, buat database baru khusus proyek lalu sesuaikan `DB_*` sebelum migrasi. Jangan gunakan database proyek lain.

## Alur penggunaan

1. Anggota mendaftar. Petugas menerima dan menimbang sampah.
2. Petugas memilih anggota, kategori, dan berat, lalu mencatat setoran.
3. Petugas memeriksa transaksi dan melakukan verifikasi dengan alasan/catatan. Saldo baru dikreditkan pada tahap ini.
4. Anggota mengajukan penarikan dari saldo tersedia. Dana tertahan untuk mencegah pengajuan yang menggunakan saldo yang sama.
5. Setelah uang benar-benar diserahkan, petugas memilih konfirmasi tunai dan mencatat penerimaan. Jika ditolak, saldo tersedia kembali.

Pembatalan setoran terverifikasi membutuhkan saldo tersedia yang cukup, termasuk setelah memperhitungkan penahanan penarikan. Mutasi asli tidak dihapus. Jejak audit menyimpan pelaku, waktu, perubahan status, alasan, serta perubahan kategori/harga. UI menampilkan 30 audit terbaru; catatan lama tetap ada di database.

## Pengujian

```powershell
php artisan route:list --except-vendor
php artisan test
npm run build
npm run test:e2e
```

PHPUnit memakai SQLite dalam memori. Playwright memakai Microsoft Edge yang sudah terpasang, port 8022, akun sementara berkata sandi acak, dan `database/.browser-test.sqlite` yang dibuat ulang khusus pengujian. Tidak menyentuh database aplikasi. Screenshot/trace hanya lokal pada `test-results/` yang diabaikan Git. Jika Edge tidak tersedia, sesuaikan `channel` di `playwright.config.ts` dengan browser yang tersedia.

Tes memeriksa registrasi, saldo terverifikasi, pembatasan akses, ketepatan berat/harga, penarikan dan penahanan saldo, transaksi pembalik, ekspor, serta viewport desktop/tablet/ponsel. Pengujian viewport bukan pengujian perangkat fisik.

## Catatan

Pencatatan tunai tidak mengirim transfer bank dan tidak mengklaim transaksi bank sungguhan. Saldo adalah kewajiban bank sampah kepada anggota. Laporan keuangan memakai tanggal mutasi; rekap berat memakai tanggal pencatatan setoran yang masih terverifikasi. Pengurus bertanggung jawab mencocokkan kas fisik dengan catatan.

Gunakan HTTPS, `APP_DEBUG=false`, akun petugas terpercaya, serta pencadangan database untuk pemakaian operasional. Arahkan document root ke `public/`. Kredensial, database, screenshot, dependensi lokal, dan build tidak disertakan di repository. Berkas kode aplikasi dibatasi maksimal 300 baris.
