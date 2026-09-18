# Vibe Coding Instructions — Hafalku

## 1. Cara Menggunakan Dokumen Ini
Gunakan pengerjaan bertahap. Jangan minta model membuat seluruh aplikasi sekaligus.

Aturan:
1. Satu fase = satu target yang jelas.
2. Sebelum coding, minta model membaca file brief terkait.
3. Minta model membuat plan.
4. Minta model mengimplementasikan hanya fase aktif.
5. Setelah implementasi, minta:
   - lint;
   - typecheck;
   - test;
   - build.
6. Jangan lanjut fase berikutnya bila acceptance criteria belum terpenuhi.
7. Hindari rewrite besar tanpa kebutuhan.

## 2. Prompt Pembuka — Repository Root
```txt
Read all project .md files first, especially:
- 00-README.md
- 01-PRODUCT-BRIEF.md
- 06-QURAN-DATA-INTEGRITY.md

Do not code yet.

Summarize:
1. product goal,
2. non-negotiable Quran-data rules,
3. MVP boundaries,
4. architecture,
5. risks.

Then propose an implementation sequence.
Do not expand scope.
```

## 3. Prompt Frontend Foundation
```txt
You are working only on the frontend.

Read:
- 02-FRONTEND-BRIEF.md
- 03-FRONTEND-IMPLEMENTATION-PLAN.md
- 07-DATABASE-AND-API-CONTRACT.md

Implement Phase F0 only.

Constraints:
- React + TypeScript + Refine Core 5.
- Refine is headless; do not create generic admin UI.
- Child-facing UI must be custom.
- No backend implementation.
- No Quran API integration yet.
- No decorative Islamic clichés.
- Keep architecture simple.

Before coding:
1. inspect repository,
2. write a short plan,
3. list files to create/modify.

After coding run:
- lint
- typecheck
- tests
- production build

Report failures and fix them before finishing.
```

## 4. Prompt Frontend Static Prototype
```txt
Implement Frontend Phase F1 only.

Use local static fixtures for:
- Al-Ikhlas
- Al-Falaq
- An-Nas

Build:
- Child Home
- Surah list
- Memorization Player
- Arabic display
- Latin toggle
- Translation toggle
- Focus Mode

Rules:
- Arabic must always remain available.
- Never create Latin-only mode.
- No audio yet.
- Do not connect to backend.
- Prioritize mobile 320–430px.
- Avoid crowded UI.
- Arabic is the visual hero.

Run lint/typecheck/tests/build.
```

## 5. Prompt Frontend Audio
```txt
Implement Frontend Phase F2 only.

Add deterministic verse audio controls:
- play/pause
- repeat 1x
- repeat 3x
- repeat 5x
- repeat 10x

Constraints:
- only one audio instance may play;
- changing verse cancels current repeat;
- show loading and error states;
- do not add autoplay on page load;
- do not add backend work.

Add tests for repeat behavior.
```

## 6. Prompt Backend Foundation
```txt
You are working only on the backend.

Read:
- 04-BACKEND-BRIEF.md
- 05-BACKEND-IMPLEMENTATION-PLAN.md
- 06-QURAN-DATA-INTEGRITY.md
- 07-DATABASE-AND-API-CONTRACT.md

Implement Phase B0 only.

Use:
- TypeScript
- Neon PostgreSQL
- a typed schema/query layer
- Zod or equivalent validation
- /api/v1 versioning

Do not create Quran tables yet.
Do not create auth yet.
Do not create frontend files.

Deliver:
- env validation
- DB connection
- migration setup
- error format
- structured logging
- test harness
- health endpoint

Run tests and build.
```

## 7. Prompt Quran Core Schema
```txt
Implement Backend Phase B1 only.

Create Quran Core schema from 07-DATABASE-AND-API-CONTRACT.md.

Critical rules:
- Quran text is immutable through application API.
- No PATCH/PUT/DELETE verse endpoints.
- dataset version must be explicit.
- all canonical data changes occur through importer workflow.
- memorization metadata must not be stored inside Arabic text.

Create migrations and tests.
```

## 8. Prompt Dataset Importer
```txt
Implement Backend Phase B2 only.

Create CLI commands:
- quran:import
- quran:validate
- quran:diff
- quran:activate

Rules:
- import never activates automatically;
- activation requires VERIFIED state;
- keep previous dataset versions;
- generate content hash;
- validate duplicate/missing verse;
- write machine-readable validation report;
- never normalize/modify Arabic silently.

Do not download data from Quran.com.
Importer should accept local versioned dataset files.
```

## 9. Prompt API Integration
```txt
Implement Backend Phase B3 only.

Create read-only endpoints:
- GET /api/v1/quran/surahs
- GET /api/v1/quran/surahs/:number
- GET /api/v1/quran/verses/:verseKey
- GET /api/v1/quran/verses/:verseKey/words
- GET /api/v1/quran/verses/:verseKey/audio

Use only ACTIVE dataset.

No write endpoints for Quran Core.
Add pagination only where useful.
Add tests.
```

## 10. Prompt Progress & Murajaah
```txt
Implement only the progress/review backend phase described in the plan.

Rules:
- keep review algorithm simple and deterministic;
- algorithm belongs to backend;
- write unit tests for each assessment result;
- do not add AI;
- do not add speech recognition;
- do not add gamification;
- do not add teacher features.

Return next_review_at from backend.
```

## 11. Review Prompt
Gunakan setelah setiap fase:
```txt
Review the current implementation against the active phase only.

Check:
1. scope creep,
2. architecture violations,
3. Quran data integrity violations,
4. security issues,
5. accessibility issues,
6. mobile UX issues,
7. unnecessary abstraction,
8. dead code,
9. test gaps.

Do not rewrite everything.
Fix only concrete issues with clear value.
Then run lint, typecheck, tests, and build.
```

## 12. Anti-Slop Rules
Model coding tidak boleh:
- membuat banyak card tanpa kebutuhan;
- menambah gradient/decorative blobs;
- menambah icon di setiap heading;
- membuat dashboard penuh chart;
- membuat generic SaaS sidebar pada child UI;
- membuat text filler;
- membuat fitur "AI" hanya untuk terlihat modern;
- menambah dependency tanpa alasan.

Prinsip:
**subtract first.**

Jika elemen UI tidak membantu:
- orientasi,
- hafalan,
- feedback,
- tindakan,
maka hapus.

## 13. Commit Strategy
Per fase:
- `feat/frontend-foundation`
- `feat/memorization-player`
- `feat/audio-repeat`
- `feat/quran-core-schema`
- `feat/quran-importer`
- `feat/quran-read-api`
- `feat/progress-engine`
- `feat/review-engine`

Hindari satu commit raksasa.

## 14. Definition of Done
Sebuah fase selesai bila:
- acceptance criteria terpenuhi;
- lint pass;
- typecheck pass;
- tests pass;
- build pass;
- tidak ada TODO kritis tersembunyi;
- dokumentasi API/schema diperbarui bila berubah.


## 15. Anti-Slop Installation & Mandatory Gate

Sebelum memulai implementasi UI, install/update anti-slop:

```bash
npx antislop-ai
```

Kemudian agent wajib membaca:
- `10-ANTI-SLOP-AI.md`
- `02-FRONTEND-BRIEF.md`
- active implementation phase.

Tambahkan ke setiap prompt frontend:

```txt
Apply the project's anti-slop rules from 10-ANTI-SLOP-AI.md.

Mandatory:
- direction resolution before implementation,
- asset clarification before adding any image/decorative asset,
- subtract first,
- no redundant eyebrow badge,
- no decorative status dot,
- no card proliferation,
- no filler copy,
- no generic SaaS visual language,
- run the Delivery Gate before finishing.

Functional correctness comes first.
Do not redesign unrelated screens.
```

### Mandatory Final Review Prompt
```txt
Before declaring this phase complete, run the Anti-Slop Delivery Gate defined in 10-ANTI-SLOP-AI.md.

Report:
- what was removed,
- what was kept and why,
- any remaining intentional exception,
- lint status,
- typecheck status,
- test status,
- build status.

Do not add features during this review.
```
