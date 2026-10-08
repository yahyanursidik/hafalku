# Changelog

## [0.2.0] - 2026-10-08

### Added
- Halaman `/hijaiyah`: 28 huruf dasar, Hamzah dan gabungan Lam-alif.
- Nama Arab, pelafalan nama dalam Latin, penjelasan bentuk, dan rujukan materi.
- Pilihan huruf berurutan, navigasi keyboard, serta akses dari beranda dan menu utama.
- Pencarian surah Juz Amma berdasarkan nama, nomor, atau arti.

### Improved
- Empat warna pastel yang konsisten antara kartu dan panel huruf terpilih.
- Grid huruf fleksibel mengikuti lebar panel, termasuk layar ponsel 320–430px.
- Metrik font khusus hijaiyah dan ruang glyph terpisah agar ekor huruf tidak menimpa label.
- Latin besar secara default pada pemutar hafalan, kelompok kontrol yang lebih jelas, dan navigasi ayat lebih ringkas.
- Tata letak daftar surah dan navigasi seluler.

### Notes
- Warna hijaiyah adalah bantuan visual, bukan klasifikasi makhraj atau tajwid.
- Pelafalan hijaiyah masih tertulis; rilis ini tidak menambah audio hijaiyah.
- Tidak mengubah teks/dataset Quran, backend, atau file font Quran.
- Perubahan metrik font hanya berlaku pada tampilan hijaiyah, memakai file font lokal yang sama.
- Versi aplikasi menggunakan SemVer. Fitur baru naik dari `0.1.0` ke `0.2.0`; tag rilis: `v0.2.0`.
- Versi dataset Quran tetap terpisah dan tidak berubah dalam rilis aplikasi ini.

### Verification
- Lint, frontend/backend typecheck, 44 tes, dan production build.
- Pemeriksaan browser pada lebar 320, 375, 414, 768, dan 1280 px: tidak ada overflow horizontal.
- Huruf ber-ekor (termasuk Ghain) tetap berada di ruang glyph; label kartu memiliki jarak terpisah.
- Build masih memberi peringatan ukuran bundle JavaScript di atas 500 kB, tanpa kegagalan build.

## [0.1.0]

- Fondasi Hafalku: pembelajaran Juz Amma, pemutar hafalan, dan antarmuka ramah anak.
- Font Quran lokal untuk konsistensi huruf dan tanda baca lintas perangkat.
