# Kontribusi ke Bank Sampah Digital

Ikuti [README](README.md) untuk instalasi, alur penggunaan, dan batasan aplikasi.

## Melaporkan masalah

Sertakan versi PHP/Node.js, langkah reproduksi, hasil yang diharapkan, dan hasil aktual. Untuk masalah saldo atau setoran, jelaskan urutan perubahan status memakai data contoh. Hapus kata sandi, token, alamat email anggota, dan data pribadi dari log atau tangkapan layar sebelum membagikannya.

## Menyiapkan perubahan

1. Buat branch terpisah dari `main` dan batasi PR pada satu tujuan yang jelas.
2. Gunakan database lokal khusus proyek; jangan arahkan pengujian ke database operasional atau proyek lain.
3. Jangan commit `.env`, database SQLite, kredensial, dependensi lokal, build, atau hasil screenshot/trace pengujian.
4. Pertahankan lockfile kecuali perubahan dependensi memang diperlukan.

## Validasi sebelum PR

Untuk perubahan aplikasi, jalankan pemeriksaan yang relevan dari root proyek setelah mengikuti instalasi README:

```sh
php artisan route:list --except-vendor
php artisan test
npm run build
```

Untuk perubahan alur pengguna atau tampilan, jalankan juga `npm run test:e2e`. Lihat README untuk kebutuhan Microsoft Edge, port 8022, dan database pengujian terpisah. Jangan mengganti konfigurasi tes agar memakai database aplikasi.

Untuk perubahan dokumentasi saja, periksa tautan, format Markdown, dan kecocokan perintah dengan berkas proyek. Jelaskan bila tes runtime tidak dijalankan.

## Isi Pull Request

Jelaskan masalah, perubahan perilaku, hasil pemeriksaan yang benar-benar dijalankan, dan keterbatasan yang masih ada. Untuk logika setoran/penarikan, periksa bahwa saldo tidak dikreditkan atau dipotong dua kali dan jejak audit tetap tersimpan. Tunggu pemeriksaan wajib repository; jangan melewati aturan merge. Setelah PR merged, hapus hanya branch kontribusi yang sudah tidak digunakan.
