# Backend Implementation Plan — Bertahap

## Phase B0 — Project Foundation
- Neon connection
- ORM/query layer
- env validation
- logging
- error handler
- API versioning `/api/v1`
- migration setup
- test database setup

## Phase B1 — Quran Core Schema
Buat:
- quran_dataset_versions
- quran_surahs
- quran_verses
- quran_words
- quran_translations
- verse_translations
- verse_transliterations
- quran_reciters
- quran_audio

Belum buat auth/progress.

## Phase B2 — Dataset Importer
Buat CLI:
- `quran:import`
- `quran:validate`
- `quran:diff`
- `quran:activate`

Import tidak langsung ACTIVE.

State:
- IMPORTED
- VALIDATING
- REVIEW_REQUIRED
- VERIFIED
- ACTIVE
- REJECTED

## Phase B3 — Read-only Quran API
Endpoints:
- list surah
- get surah
- get verse
- get words
- get translation
- get audio metadata

Tidak ada write route.

## Phase B4 — Auth & Child Profile
- parent registration/login;
- session;
- child CRUD;
- ownership rules.

## Phase B5 — Memorization Progress
Buat:
- memorization_plan;
- verse_progress;
- attempts;
- sessions.

Endpoints:
- start session;
- submit assessment;
- mark repetition;
- update progress.

## Phase B6 — Murajaah Engine
- due reviews;
- complete review;
- reschedule;
- rule tests.

## Phase B7 — Parent Dashboard API
- child summary;
- current target;
- due count;
- recent progress.

## Phase B8 — Hardening
- indexes;
- query profiling;
- rate limit;
- abuse protection;
- auth audit;
- backup/restore drill;
- error observability.

## Phase B9 — PWA Support
Tambahkan endpoint/manifest data untuk:
- downloadable surah package metadata;
- version checking;
- sync progress queue.

Jangan implement offline merge sebelum progress model stabil.
