# Hafalku — Project Brief & Vibe Coding Pack

## Tujuan Dokumen
Paket dokumen ini adalah acuan pengembangan aplikasi **Hafalku** — pendamping hafalan Al-Qur'an untuk anak dan keluarga.

Arsitektur utama:
- Frontend: React + TypeScript + Refine Core 5
- Backend/API: Vercel Functions / Route Handlers
- Database: Neon PostgreSQL
- Qur'an dataset: mandiri, versioned, read-only
- Audio: object storage / CDN milik sendiri atau sumber audio yang memiliki izin distribusi
- Deployment: Vercel
- PWA: fase lanjutan
- Runtime dependency ke Quran.com / Quran Foundation: **tidak ada**

## Prinsip Produk
Hafalku bukan sekadar "Qur'an reader", tetapi sistem belajar:

**Dengar → Ikuti → Lihat → Ulangi → Kurangi Bantuan → Ingat → Murajaah**

Prinsip penting:
1. Arabic selalu tersedia dan menjadi pusat tampilan.
2. Latin hanya bantuan sementara, bukan tujuan belajar.
3. Tidak ada "Latin only mode".
4. Audio menjadi rujukan pelafalan.
5. Warna digunakan untuk visual chunking, bukan klaim "warna tertentu otomatis meningkatkan memori".
6. Teks Qur'an bersifat immutable/read-only.
7. Metadata pembelajaran dipisahkan dari teks Qur'an.
8. Data anak dikumpulkan seminimal mungkin.
9. Tidak menggunakan leaderboard, streak agresif, atau gamification berlebihan.
10. AI tidak digunakan untuk menghasilkan teks Qur'an, transliterasi, atau validasi tajwid produksi.

## Struktur Dokumen
- `01-PRODUCT-BRIEF.md`
- `02-FRONTEND-BRIEF.md`
- `03-FRONTEND-IMPLEMENTATION-PLAN.md`
- `04-BACKEND-BRIEF.md`
- `05-BACKEND-IMPLEMENTATION-PLAN.md`
- `06-QURAN-DATA-INTEGRITY.md`
- `07-DATABASE-AND-API-CONTRACT.md`
- `08-VIBE-CODING-INSTRUCTIONS.md`
- `09-AGENTS.md`
- `10-ANTI-SLOP-AI.md`

## Urutan Pengerjaan
1. Lock product scope.
2. Siapkan Qur'an Core Dataset.
3. Buat backend foundation.
4. Buat API contract.
5. Buat frontend shell.
6. Buat Memorization Player.
7. Tambahkan progress + murajaah.
8. Tambahkan parent dashboard.
9. Hardening, testing, accessibility.
10. PWA/offline sebagai fase berikutnya.

## MVP
Untuk MVP, batasi ke Juz 30 atau bahkan mulai dari:
- Al-Ikhlas
- Al-Falaq
- An-Nas

Fitur MVP:
- Arabic besar
- Bantuan Latin ON/OFF
- Arti ON/OFF
- Audio per ayat
- Repeat 1x/3x/5x/10x
- Visual chunking
- Hide/reveal
- Hint
- Parent account
- Child profile
- Progress ayat
- Murajaah sederhana
- Focus mode


## Anti-Slop Baseline

Project ini menggunakan `miqdadbadjuber/anti-slop` sebagai quality filter untuk hasil vibe coding.

Baseline saat dokumen ini diperbarui:
- release: `v3.2.9`
- install/update: `npx antislop-ai`

Baca `10-ANTI-SLOP-AI.md` sebelum mengimplementasikan atau mereview UI.

Anti-slop berada di bawah prioritas:
1. Qur'an Data Integrity
2. Product Brief
3. Accessibility
4. Anti-Slop
5. Stylistic preference
