# Product Brief — Hafalku

## 1. Product Statement
**Hafalku** adalah aplikasi pendamping hafalan Al-Qur'an untuk anak dan keluarga yang membantu anak belajar melalui audio, tampilan Arab yang jelas, bantuan transliterasi sementara, pengulangan terarah, progressive hiding, dan murajaah.

Tagline kerja:
> **Dengar. Ulangi. Ingat.**

## 2. Problem
Beberapa anak:
- belum lancar membaca huruf Arab;
- sudah bisa membaca, tetapi kesulitan mempertahankan fokus;
- menghafal tanpa sistem murajaah;
- terlalu bergantung pada orang tua untuk menentukan ayat yang perlu diulang;
- menggunakan aplikasi Qur'an yang dirancang sebagai reader, bukan learning tool.

## 3. Target User
### Primary
- Anak usia kurang lebih 5–12 tahun.
- Orang tua yang mendampingi hafalan.
- Anak homeschooling / homebased learning.
- Siswa sekolah Islam / TPQ / rumah tahfizh.

### Secondary
- Guru tahfizh.
- Wali kelas.
- Pengelola halaqah.

Teacher mode bukan MVP.

## 4. Core Learning Loop
1. Dengarkan.
2. Ikuti.
3. Lihat.
4. Ulangi.
5. Kurangi bantuan.
6. Coba dari ingatan.
7. Nilai sendiri.
8. Jadwalkan murajaah.

## 5. Learning Modes

### Talaqqi Mode
Fokus pada:
- audio;
- dengarkan;
- ikuti;
- repeat;
- Arabic tetap terlihat atau dapat ditampilkan bertahap.

### Baca Mode
Fokus:
- Arabic besar;
- typography nyaman;
- optional Latin;
- optional translation;
- optional visual chunking.

### Hafal Mode
Fokus:
- hide/reveal;
- progressive masking;
- hint kata pertama;
- repeat;
- recall;
- self-assessment.

## 6. Assistance Levels

### Level 1 — High Assistance
- Arabic: ON
- Latin: ON
- Audio: prominent
- Translation: optional
- Chunking: ON

### Level 2 — Reduced Assistance
- Arabic: ON
- Latin: smaller
- Audio: ON
- Translation: optional

### Level 3 — Arabic Focus
- Arabic: ON
- Latin: OFF
- Audio: ON

### Level 4 — Recall
- Arabic hidden
- Hint available
- Audio hint optional

## 7. Non-Negotiable Content Rules
- Tidak ada mode Latin-only.
- Teks Qur'an tidak boleh diedit oleh CMS biasa.
- Transliterasi adalah learning aid, bukan Qur'an.
- Translation dipisahkan dari Arabic.
- Memorization chunk tidak boleh mengubah canonical Arabic text.
- Semua perubahan dataset harus versioned dan auditable.

## 8. Color System
Warna digunakan untuk:
- visual grouping;
- chunking;
- membedakan unit hafalan;
- membantu scanning visual.

Warna **bukan** digunakan dengan klaim pseudoscientific seperti:
- merah meningkatkan memori;
- biru meningkatkan konsentrasi.

Color palette harus:
- lembut;
- high-contrast terhadap Arabic;
- tidak terlalu ramai;
- accessible.

## 9. Gamification
Gunakan minimal.

Boleh:
- progress;
- target;
- completion state;
- gentle encouragement.

Hindari:
- leaderboard;
- skor kompetitif;
- streak agresif;
- confetti berlebihan;
- badge yang menggeser niat belajar menjadi mengejar reward.

## 10. Child Account Model
Gunakan:
- Parent account
- Child profiles

Anak tidak wajib memiliki email.

Child profile:
- display name
- age band
- reading level
- preferences

Hindari:
- lokasi;
- sekolah;
- tanggal lahir presisi;
- foto wajah;
- data suara permanen tanpa kebutuhan jelas.

## 11. Progress States
- NEW
- LEARNING
- MEMORIZING
- REVIEW
- FLUENT

Catatan:
"FLUENT" bukan berarti tidak perlu murajaah.

## 12. Murajaah
Awal MVP:
- review hari yang sama;
- besok;
- 3 hari;
- 7 hari;
- 14 hari;
- 30 hari.

Kemudian dapat menjadi adaptif berdasarkan:
- self-assessment;
- hint count;
- repetition count;
- review success.

## 13. Self Assessment
Pilihan anak:
- Masih perlu bantuan
- Sedikit lupa
- Lancar

Backend menentukan `next_review_at`.

## 14. MVP Scope
Mulai dari tiga surah:
- Al-Ikhlas
- Al-Falaq
- An-Nas

Setelah UX valid, perluas ke Juz 30.

## 15. Out of Scope MVP
- speech recognition;
- AI pronunciation scoring;
- teacher dashboard;
- halaqah;
- leaderboard;
- social feed;
- AI-generated tafsir;
- full offline audio library;
- seluruh 30 juz langsung.
