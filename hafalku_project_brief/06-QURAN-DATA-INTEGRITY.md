# Qur'an Data Integrity Policy

## 1. Tujuan
Dokumen ini adalah guardrail utama agar kebutuhan UI/learning tidak merusak canonical Qur'an content.

## 2. Canonical Dataset
Simpan sebagai artifact versioned, bukan hanya di database.

Contoh:
```txt
datasets/quran/
  v1.0.0/
    metadata.json
    surahs.json
    verses.json
    words.json
    translations-id.json
    transliterations-id.json
    SHA256SUMS
```

## 3. Immutable Rule
Canonical Arabic text tidak boleh:
- diedit melalui admin UI;
- diberi HTML inline;
- diwarnai langsung di source;
- disisipkan marker hafalan;
- dimodifikasi oleh AI.

## 4. Learning Metadata Terpisah
Gunakan:
- memorization_chunks;
- word visibility state;
- UI visual group;
- learner annotations.

## 5. Dataset Change Workflow
1. Import new version.
2. Validate.
3. Produce diff.
4. Human review.
5. Quran reviewer approval.
6. Mark VERIFIED.
7. Activate explicitly.
8. Keep previous version.

## 6. Validation
Minimum:
- 114 surah;
- no missing verse;
- no duplicate verse key;
- sequential ayah numbering;
- required Arabic not empty;
- Unicode normalization;
- checksum;
- translation coverage check;
- transliteration coverage check;
- audio mapping consistency.

## 7. Transliteration
Transliteration adalah learning aid.

Harus:
- versioned;
- reviewable;
- source tracked;
- memiliki approval state.

Tidak boleh:
- dianggap canonical Qur'an;
- generated dynamically oleh AI di production.

## 8. Translation
Simpan source:
- title;
- edition;
- year;
- attribution;
- license/usage note.

## 9. Audio
Simpan:
- reciter;
- source;
- license note;
- verse mapping;
- checksum;
- duration.

## 10. CI Gate
Jika file canonical dataset berubah:
- CI menandai change;
- deploy production harus membutuhkan reviewer approval.

## 11. Backups
Harus ada:
- dataset artifact;
- database backup;
- migration history.

Database bukan satu-satunya copy Qur'an dataset.
