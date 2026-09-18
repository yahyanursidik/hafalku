# Anti-Slop AI Guideline — Hafalku

## 1. Purpose

Hafalku menggunakan **anti-slop AI** sebagai guardrail desain dan implementasi agar hasil vibe coding tidak berubah menjadi UI generik, dekoratif, penuh filler, atau terlihat seperti template AI.

Reference:
- Repository: `miqdadbadjuber/anti-slop`
- Release baseline saat dokumen ini dibuat: `v3.2.9`
- Installer: `npx antislop-ai`

Anti-slop bukan pengganti product brief atau design direction. Ia adalah **quality filter** yang harus berjalan bersama keputusan produk Hafalku.

---

## 2. Mandatory Principle

> Every element must earn its place.

Sebuah elemen UI hanya boleh ada bila membantu salah satu dari:
1. orientasi;
2. memahami ayat;
3. melakukan tindakan belajar;
4. menerima feedback;
5. melihat progress;
6. mengurangi kesalahan.

Jika tidak membantu salah satu di atas, hapus.

---

## 3. Subtract First

Sebelum menambah:
- card;
- badge;
- icon;
- illustration;
- gradient;
- decorative shape;
- animation;
- section;
- helper copy;

tanyakan:

> Apakah layar tetap jelas tanpa elemen ini?

Jika ya, mulai dari versi tanpa elemen tersebut.

---

## 4. Hafalku-Specific Anti-Slop Rules

### 4.1 Arabic Is the Hero
Pada Memorization Player:
- Arabic adalah fokus utama;
- UI controls berada di posisi sekunder;
- Latin tidak boleh lebih dominan ketika anak sudah berada pada reading level yang lebih tinggi;
- translation tidak boleh mengambil perhatian utama.

### 4.2 Avoid Card Proliferation
Jangan membungkus setiap elemen dalam card.

Buruk:
```txt
[ card greeting ]
[ card progress ]
[ card continue ]
[ card review ]
[ card quote ]
[ card tip ]
```

Lebih baik:
- satu primary action;
- satu review section;
- satu simple progress summary.

### 4.3 Avoid Decorative Islamic Clichés
Jangan menambah:
- arch;
- kubah;
- lantern;
- bulan;
- bintang;
- pola Arab dekoratif;
- ornamen geometris yang tidak memiliki fungsi;
- ilustrasi masjid sebagai filler.

Identitas Qur'anic dibangun melalui:
- Arabic typography;
- calm spacing;
- content hierarchy;
- intentional interaction.

### 4.4 No Fake Premium UI
Hindari:
- excessive blur;
- glassmorphism tanpa fungsi;
- neon glow;
- glowing buttons;
- gradient besar hanya untuk terlihat modern;
- shadow berlapis;
- giant rounded containers everywhere.

### 4.5 No Redundant Eyebrow Badge
Jangan membuat badge kecil di atas heading yang mengulang heading.

Buruk:
```txt
[ HAFALAN ]
Lanjutkan Hafalan
```

Jika konteks sudah jelas, cukup:
```txt
Lanjutkan Hafalan
```

### 4.6 No Decorative Status Dot
Status dot hanya boleh digunakan jika:
- status memang memiliki arti;
- ada label tekstual;
- warna bukan satu-satunya indikator.

Jangan membuat dot hanya untuk estetika.

### 4.7 No Feature Filler
Jangan menambah fitur karena:
- aplikasi lain memilikinya;
- terlihat canggih;
- AI menyarankan;
- dashboard terasa kosong.

Kosong bukan masalah bila fokus pengguna menjadi lebih jelas.

---

## 5. Copy Anti-Slop

### Hindari
- subtitle yang hanya mengulang title;
- motivational filler;
- jargon;
- AI-sounding copy;
- headline panjang yang tidak membantu aksi;
- copy "smart", "powerful", "seamless", "next-generation" tanpa bukti.

### Gunakan
- label tindakan;
- instruksi singkat;
- feedback konkret;
- pesan sesuai konteks anak.

Contoh:

Buruk:
> Tingkatkan perjalanan spiritual Ananda dengan pengalaman hafalan yang cerdas dan menyenangkan.

Lebih baik:
> Dengarkan ayat ini 3 kali.

---

## 6. Interaction Anti-Slop

Jangan:
- autoplay tanpa user action;
- animasi berlebihan setelah setiap tindakan;
- confetti;
- haptic untuk semua tap;
- modal untuk hal sederhana;
- toast untuk setiap perubahan kecil.

Gunakan feedback dekat dengan aksi.

Contoh:
```txt
Repeat 3×
2 dari 3 selesai
```

lebih baik daripada toast:
```txt
Great! Amazing progress!
```

---

## 7. Layout Rules

### Mobile First
Prioritas:
- 320–430px;
- tidak ada horizontal scroll;
- controls mudah dijangkau;
- Arabic tetap besar.

### Maximum Primary Actions
Dalam satu viewport utama:
- satu primary action;
- secondary actions maksimal seperlunya.

### Whitespace
Whitespace bukan area yang harus diisi.

Jika layar terasa kosong tetapi:
- Arabic jelas;
- tindakan jelas;
- pengguna tahu langkah berikutnya;

maka layout sudah cukup.

---

## 8. Component Creation Gate

Sebelum membuat component baru, jawab:
1. Apakah digunakan lebih dari sekali?
2. Apakah mewakili domain concept?
3. Apakah memisahkan kompleksitas nyata?
4. Apakah native HTML + existing component cukup?

Jangan membuat abstraction hanya karena komponen terlihat "rapi".

---

## 9. Dependency Gate

Sebelum menambah package:
1. Apa masalah konkret yang diselesaikan?
2. Apakah browser/platform API sudah cukup?
3. Apakah dependency maintenance masuk akal?
4. Apakah bundle size sepadan?

Jangan menambah library:
- animation;
- icon;
- state;
- forms;
- date;

jika kebutuhan sederhana sudah terpenuhi oleh stack yang ada.

---

## 10. Direction Resolution Gate

Sebelum implementasi layar baru, pastikan:
- siapa user;
- apa tujuan layar;
- satu tindakan utama;
- informasi yang harus terlihat;
- informasi yang boleh tersembunyi;
- apa yang tidak perlu.

Jika direction belum jelas, jangan mulai menghias.

---

## 11. Asset Clarification Gate

Sebelum menambah asset:
- apakah asset dibutuhkan?
- apakah punya makna?
- apakah source/license jelas?
- apakah UI lebih baik tanpa asset?

Untuk Hafalku:
- jangan gunakan gambar dekoratif untuk mengisi ruang;
- Arabic text sendiri dapat menjadi visual utama.

---

## 12. Delivery Gate

Sebelum sebuah fase dianggap selesai, lakukan review berikut.

### Product
- [ ] sesuai active phase;
- [ ] tidak ada scope creep;
- [ ] primary action jelas.

### UI
- [ ] tidak ada card proliferation;
- [ ] tidak ada decorative filler;
- [ ] tidak ada redundant eyebrow badge;
- [ ] tidak ada meaningless status dot;
- [ ] whitespace dipertahankan;
- [ ] Arabic tetap hero.

### Copy
- [ ] tidak ada filler copy;
- [ ] tidak ada jargon generik;
- [ ] labels actionable;
- [ ] helper copy hanya bila diperlukan.

### Technical
- [ ] tidak ada dependency tanpa alasan;
- [ ] tidak ada abstraction prematur;
- [ ] lint pass;
- [ ] typecheck pass;
- [ ] test pass;
- [ ] build pass.

### Quran Integrity
- [ ] canonical Arabic tidak berubah;
- [ ] Latin tetap learning aid;
- [ ] tidak ada Latin-only mode;
- [ ] learning metadata terpisah.

---

## 13. Anti-Slop Review Prompt

Gunakan setelah UI selesai:

```txt
Run an anti-slop review before changing code.

Evaluate this implementation against:
1. every element must earn its place,
2. subtract first,
3. Arabic is the visual hero,
4. no card proliferation,
5. no decorative Islamic clichés,
6. no redundant eyebrow badges,
7. no meaningless status dots,
8. no filler copy,
9. no excessive gradients/shadows/glass,
10. no unnecessary dependency,
11. no premature abstraction,
12. mobile-first usability.

List concrete violations only.

Then make the smallest changes required to remove those violations.
Do not redesign the entire product.
Do not add new features.

Finally run:
- lint
- typecheck
- tests
- build

Return a short Delivery Gate report.
```

---

## 14. Installation for Coding Agent

At repository root:

```bash
npx antislop-ai
```

When updating an existing installation, rerun the installer and use the overwrite/update route appropriate to the tool setup.

After installation:
- keep project-specific Hafalku rules in `AGENTS.md`;
- keep this file as the product-specific interpretation;
- anti-slop instructions must not override Qur'an Data Integrity rules.

Priority:

```txt
Quran Integrity
      ↓
Product Brief
      ↓
Accessibility
      ↓
Anti-Slop
      ↓
Stylistic preference
```

---

## 15. Definition of Good UI for Hafalku

A good Hafalku screen should feel:

- calm;
- obvious;
- intentional;
- content-first;
- age-appropriate;
- respectful toward Qur'an;
- easy to use repeatedly.

It should **not** look like:
- AI landing page;
- SaaS admin template;
- gamified learning toy;
- generic Islamic template.
