# Frontend Brief — Hafalku

## 1. Objective
Membangun frontend child-first yang:
- sederhana;
- tenang;
- cepat;
- fokus pada Arabic;
- tidak terasa seperti SaaS dashboard;
- dapat digunakan anak dan orang tua dengan sedikit instruksi.

## 2. Stack
- React
- TypeScript
- Refine Core 5 sebagai headless application layer
- TanStack Query melalui integration Refine
- Custom UI components
- CSS/Tailwind boleh dipilih sesuai preferensi tim
- Vercel
- PWA: Phase 2

## 3. Prinsip Penggunaan Refine
Refine digunakan untuk:
- auth integration;
- data fetching;
- mutations;
- permissions;
- resource orchestration;
- cache invalidation.

Refine **tidak menentukan tampilan**.

Child UI tidak boleh menyerupai:
- CRUD admin;
- sidebar enterprise;
- data table SaaS;
- dashboard penuh chart.

## 4. Information Architecture

### Child
- Home
- Hafalan
- Murajaah
- Surah
- Profile

### Parent
- Children
- Child Progress
- Learning Settings
- Targets
- Account

### Admin/Reviewer
Dapat dibuat sebagai aplikasi atau shell terpisah.

## 5. Core Screens

### 5.1 Home
Isi:
- salam/nama anak;
- continue memorization;
- murajaah hari ini;
- current target;
- recently learned surahs.

Tidak perlu chart.

### 5.2 Memorization Player
Ini layar terpenting.

Komponen:
- surah/ayah position;
- Arabic display;
- Latin toggle;
- translation toggle;
- chunk visualization;
- audio player;
- repeat;
- hide/reveal;
- hint;
- next/previous;
- "saya sudah siap";
- self-assessment setelah recall.

### 5.3 Murajaah Queue
Tampilkan:
- daftar ayat/surah hari ini;
- urutan review;
- status selesai;
- CTA "Mulai Murajaah".

### 5.4 Surah Browser
Filter:
- surah;
- Juz;
- status hafalan.

### 5.5 Parent Dashboard
Per child:
- active memorization;
- review due;
- current level;
- recent activity;
- settings.

## 6. Memorization Player States

### Reading State
Arabic visible.

### Assisted State
Arabic + Latin.

### Repeat State
Auto-repeat N times.

### Recall State
Arabic hidden/partially hidden.

### Hint State
- first word;
- reveal 3 seconds;
- play beginning audio.

### Assessment State
- need help;
- almost;
- fluent.

## 7. Design Direction

### Visual
- clean;
- quiet;
- typography-led;
- high whitespace;
- minimal decoration.

### Hindari
- arch;
- kubah;
- bulan;
- bintang;
- lantern;
- pola Islami dekoratif berlebihan;
- mascot;
- kartun random;
- gradient hijau-emas generik.

Arabic adalah hero visual.

## 8. Typography
Arabic:
- besar;
- line-height longgar;
- font Qur'anic yang teruji;
- support tanda baca/diacritics dengan benar.

Latin:
- lebih kecil dari Arabic jika anak sudah mulai membaca;
- dapat besar pada level bantuan awal.

Translation:
- tidak mengalahkan Arabic secara visual.

## 9. Accessibility
Wajib:
- font-size control;
- high contrast;
- screen reader label;
- keyboard focus;
- touch target besar;
- tidak membedakan status hanya berdasarkan warna.

## 10. State Management
Gunakan server state untuk:
- profile;
- progress;
- review queue;
- memorization plan.

Local UI state untuk:
- toggle Latin;
- toggle translation;
- hide/reveal;
- temporary repeat state;
- focus mode.

## 11. Component Structure
```txt
src/
  app/
  routes/
  components/
    quran/
      VerseDisplay.tsx
      ArabicText.tsx
      Transliteration.tsx
      Translation.tsx
      WordChunk.tsx
      QuranAudioPlayer.tsx
    memorization/
      MemorizationPlayer.tsx
      RepeatControl.tsx
      RecallControl.tsx
      HintControl.tsx
      SelfAssessment.tsx
    child/
    parent/
  features/
    auth/
    quran/
    memorization/
    review/
    progress/
  providers/
    authProvider.ts
    dataProvider.ts
    accessControlProvider.ts
  lib/
  types/
```

## 12. Frontend Quality Gates
Sebelum dianggap selesai:
- tidak ada horizontal overflow;
- Arabic readable di 320px width;
- touch target minimal nyaman;
- toggle tidak merusak layout;
- loading state;
- empty state;
- network error state;
- retry state;
- skeleton hanya bila perlu;
- tidak ada decorative slop.

## 13. Testing
Minimum:
- component tests untuk MemorizationPlayer;
- e2e untuk:
  - login parent;
  - pilih child;
  - buka hafalan;
  - toggle Latin;
  - repeat audio;
  - selesai review;
- accessibility test dasar;
- responsive test.


## 14. Anti-Slop AI Requirement
Frontend wajib mengikuti `10-ANTI-SLOP-AI.md`.

Setiap layar harus melewati:
- direction resolution;
- asset clarification;
- anti-slop review;
- Delivery Gate.

Forbidden-by-default:
- card proliferation;
- redundant eyebrow badge;
- meaningless decorative status dot;
- generic SaaS layout;
- filler illustration;
- excessive gradient/glass/shadow;
- text filler;
- unnecessary animation.

Sebelum membuat elemen baru, terapkan:
**subtract first** dan **every element must earn its place**.
