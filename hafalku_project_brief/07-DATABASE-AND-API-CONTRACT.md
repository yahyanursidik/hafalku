# Database & API Contract

## 1. Core Tables

### quran_dataset_versions
```txt
id
version
source_name
source_version
content_hash
status
imported_at
verified_at
verified_by
activated_at
```

### quran_surahs
```txt
id
dataset_version_id
surah_number
name_ar
name_id
ayah_count
revelation_type
```

### quran_verses
```txt
id
dataset_version_id
surah_id
ayah_number
verse_key
text_uthmani
text_imlaei
content_hash
```

### quran_words
```txt
id
verse_id
position
text_arabic
```

### verse_transliterations
```txt
id
verse_id
language
text
source
version
status
reviewed_by
reviewed_at
```

### translations
```txt
id
language
title
source
edition
```

### verse_translations
```txt
id
verse_id
translation_id
text
```

### quran_audio
```txt
id
verse_id
reciter_id
asset_url
duration_ms
checksum
```

## 2. Identity Tables

### users
```txt
id
email
name
role
created_at
```

### child_profiles
```txt
id
parent_user_id
display_name
age_band
reading_level
created_at
```

## 3. Learning Tables

### memorization_plans
```txt
id
child_id
title
status
started_at
```

### memorization_items
```txt
id
plan_id
verse_id
sequence
target_date
```

### memorization_chunks
```txt
id
verse_id
chunk_order
start_word
end_word
visual_group
```

### verse_progress
```txt
id
child_id
verse_id
status
confidence
total_repetitions
audio_repetitions
hint_count
first_learned_at
last_reviewed_at
next_review_at
updated_at
```

### memorization_attempts
```txt
id
child_id
verse_id
session_id
assessment
hint_count
repetition_count
created_at
```

### learning_sessions
```txt
id
child_id
mode
started_at
completed_at
```

## 4. API

### Quran
`GET /api/v1/quran/surahs`

`GET /api/v1/quran/surahs/:number`

`GET /api/v1/quran/verses/:verseKey`

`GET /api/v1/quran/verses/:verseKey/words`

`GET /api/v1/quran/verses/:verseKey/audio`

### Child
`GET /api/v1/children`

`POST /api/v1/children`

`GET /api/v1/children/:id`

`PATCH /api/v1/children/:id`

### Progress
`GET /api/v1/children/:id/progress`

`POST /api/v1/learning/sessions`

`POST /api/v1/learning/repetition`

`POST /api/v1/learning/hint`

`POST /api/v1/learning/assessment`

### Murajaah
`GET /api/v1/children/:id/reviews`

`POST /api/v1/reviews/:reviewId/complete`

## 5. Response Convention
```json
{
  "data": {},
  "meta": {}
}
```

Error:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "requestId": "..."
  }
}
```

## 6. API Rule
Frontend tidak boleh mengetahui struktur tabel.

Frontend hanya bergantung pada API contract.
