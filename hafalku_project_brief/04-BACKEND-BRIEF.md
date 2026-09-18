# Backend Brief — Hafalku

## 1. Objective
Backend harus:
- menjadi sumber data aplikasi;
- tidak tergantung Quran.com saat runtime;
- menjaga Qur'an Core Dataset immutable;
- menyimpan progress anak;
- menjadwalkan murajaah;
- menyediakan API stabil untuk frontend.

## 2. Stack
- TypeScript
- Vercel Functions / server routes
- Neon PostgreSQL
- Drizzle ORM atau query layer terstruktur
- Zod / schema validation
- Auth provider sesuai keputusan tim
- Object Storage/CDN untuk audio

## 3. Domain Separation

### Quran Core
- surah;
- verse;
- words;
- translation;
- transliteration;
- reciter;
- audio metadata.

### Learning
- memorization plan;
- chunks;
- progress;
- attempts;
- review schedule;
- learning session.

### Identity
- users;
- parent profiles;
- child profiles;
- roles.

## 4. Quran Core Must Be Read-Only
Tidak boleh ada endpoint seperti:
`PATCH /api/quran/verses/:id`

Teks Qur'an hanya berubah melalui:
- import pipeline;
- dataset version;
- validation;
- reviewer approval.

## 5. Authentication
MVP:
- parent login;
- child profile tidak memiliki email;
- child context dipilih setelah parent login.

Roles:
- SUPER_ADMIN
- QURAN_REVIEWER
- PARENT
- CHILD_CONTEXT

## 6. Authorization
Parent hanya dapat membaca/mengubah:
- child miliknya;
- progress child miliknya;
- settings child miliknya.

Reviewer:
- melihat dataset import;
- approve/reject version;
- tidak otomatis menjadi super admin.

## 7. Data Privacy
Simpan minimum:
- parent account;
- child display name;
- age band;
- reading level.

Tidak perlu:
- alamat;
- sekolah;
- lokasi;
- tanggal lahir presisi;
- rekaman suara anak untuk MVP.

## 8. Learning Events
Simpan event penting:
- session_started;
- verse_opened;
- audio_played;
- repetition_completed;
- hint_used;
- recall_started;
- assessment_submitted;
- review_completed.

Jangan log setiap klik UI yang tidak berguna.

## 9. Murajaah Engine MVP
Input:
- assessment;
- last_reviewed_at;
- current stage.

Output:
- next_review_at.

Default:
- need_help → same day / next day
- almost → +1 or +3 days
- fluent → +7, +14, +30 days sesuai stage

Semua aturan berada di backend agar konsisten.

## 10. Audio
Backend menyimpan:
- reciter;
- verse key;
- asset URL;
- checksum;
- duration;
- source/license metadata.

Frontend tidak membangun path audio dengan asumsi sendiri.

## 11. Logging
Wajib:
- request id;
- user id jika ada;
- child id jika relevan;
- endpoint;
- status;
- latency;
- sanitized error.

Jangan log:
- password;
- auth token;
- full session cookie.

## 12. Error Contract
Semua error:
```json
{
  "error": {
    "code": "REVIEW_NOT_FOUND",
    "message": "Review item was not found",
    "requestId": "..."
  }
}
```

## 13. Backend Quality Gates
- migration repeatable;
- seed deterministic;
- no mutable Quran endpoint;
- authz tested;
- input validated;
- SQL injection-safe;
- rate limiting untuk endpoint sensitif;
- idempotency bila perlu;
- audit trail untuk dataset approval.
