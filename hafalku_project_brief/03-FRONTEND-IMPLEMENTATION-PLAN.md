# Frontend Implementation Plan — Bertahap

## Phase F0 — Foundation
Tujuan:
- project shell;
- routing;
- providers;
- environment config;
- lint;
- formatting;
- test setup.

Deliverables:
- app dapat build;
- Vercel preview;
- error boundary;
- base tokens;
- responsive shell.

Jangan membuat fitur belajar dulu.

## Phase F1 — Static Prototype
Gunakan hardcoded data 3 surah.

Buat:
- Home;
- Surah list;
- Memorization Player;
- toggles;
- focus mode.

Tidak ada API.

Acceptance:
- Arabic tampil benar;
- toggle Latin bekerja;
- toggle translation bekerja;
- layout responsive;
- player child-friendly.

## Phase F2 — Audio Experience
Tambahkan:
- audio per ayat;
- play/pause;
- repeat 1/3/5/10;
- auto-pause;
- loading/error.

Acceptance:
- repeat deterministic;
- jika user pindah ayat, repeat dibatalkan;
- tidak ada dua audio bermain bersamaan.

## Phase F3 — Recall Interaction
Tambahkan:
- hide/reveal;
- progressive word hiding;
- first-word hint;
- temporary reveal;
- self-assessment.

Acceptance:
- state tidak membingungkan;
- setelah ayat selesai, user tahu langkah berikutnya.

## Phase F4 — Backend Integration
Hubungkan:
- auth;
- child profile;
- surah/verse API;
- progress API;
- review queue.

Refactor hardcoded data.

## Phase F5 — Parent Area
Buat:
- parent shell;
- child selector;
- current target;
- progress summary;
- settings.

## Phase F6 — Accessibility & Polish
- keyboard;
- aria;
- high contrast;
- large Arabic;
- low-end device check;
- slow network check.

## Phase F7 — PWA (Phase 2 Product)
- installable;
- static shell cache;
- selected surah cache;
- offline state;
- sync progress when online.

Jangan cache seluruh audio otomatis.


## Anti-Slop Gate — Berlaku di Semua Phase
Sebelum phase frontend dianggap selesai:
1. baca `10-ANTI-SLOP-AI.md`;
2. jalankan anti-slop review;
3. hapus elemen tanpa fungsi;
4. pastikan tidak ada redundant badge/status decoration;
5. pastikan Arabic tetap hero;
6. keluarkan Delivery Gate report.

Anti-slop review dilakukan **setelah fungsi benar**, sebelum polish final.
