# Local Quran Dataset Format

Each import directory is a versioned, local artifact. The CLI never fetches Quran data from a network source.

```txt
datasets/quran/v1.0.0/
  metadata.json
  surahs.json
  verses.json
  words.json
  translations-id.json
  transliterations-id.json
  SHA256SUMS
  audio.json                 # optional
```

`metadata.json` requires `version`, `sourceName`, and optional `sourceVersion`.

`surahs.json` contains an array of objects with `surahNumber`, `nameAr`, `nameId`, `ayahCount`, and `revelationType` (`MAKKI` or `MADANI`).

`verses.json` contains an array of objects with `verseKey` (`surah:ayah`), `surahNumber`, `ayahNumber`, `textUthmani`, and optional `textImlaei`.

`words.json` contains `verseKey`, one-based `position`, and `textArabic`. Learning chunks, annotations, and display metadata do not belong in these files.

`translations-id.json` contains translation metadata (`language`, `title`, `source`, `edition`) and a `verses` array of `{ "verseKey", "text" }`.

`transliterations-id.json` contains `language`, `source`, `version`, optional approval `status`, and a `verses` array of `{ "verseKey", "text" }`.

When included, `audio.json` is an array of entries with `verseKey`, `assetUrl`, `durationMs`, `checksum`, and a `reciter` object containing `name`, `source`, and `licenseNote`.

For a shared full-surah asset, each entry must also have `startMs` and `endMs`. This keeps the source URL explicit while allowing the player to seek to a specific ayat. It does not alter the Qur'an text.

`SHA256SUMS` must list the SHA-256 for every JSON file in the directory. The validator reports a checksum mismatch; it never rewrites source text or normalizes Arabic.

Examples:

```powershell
npm run quran:validate -- --dataset datasets/quran/v1.0.0
npm run quran:diff -- --from datasets/quran/v1.0.0 --to datasets/quran/v1.0.1
npm run quran:import -- --dataset datasets/quran/v1.0.0
npm run quran:activate -- --version v1.0.0
npm run quran:audio:mp3quran -- --dataset datasets/quran/v1.0.0 --read 5
```

Import creates a version with `REVIEW_REQUIRED`, never `ACTIVE`. Activation succeeds only when an authorized reviewer workflow has already placed the dataset in `VERIFIED` state.

`quran:audio:mp3quran` is an explicit, server-side source adapter for Juz Amma (surah 78–114). It requires a timing-read ID, validates that the local dataset contains all Juz Amma verses, retrieves timing metadata, calculates the remote audio checksum without retaining audio files, writes `audio.json`, and updates `SHA256SUMS`. Run `quran:validate` after it; it does not import or activate a dataset.

## Husary full-surah timing activation

The frontend may only use ayah timestamps after the full-surah MP3s and the timing source have been proven to be the same recording. This never changes, splits, or normalizes an MP3.

1. Download the **Surah by Surah** JSON export for Mahmoud Khalil Al-Husary (Murattal), QUL/Tarteel recitation 6. Keep its `surah.json` and `segments.json`.
2. Keep the original QUL `078.mp3`–`114.mp3` files in a separate local reference directory.
3. Run the verifier. It hashes every reference MP3 and refuses activation unless each is byte-identical to the corresponding Contabo object already recorded in the upload manifest.

```powershell
npm run quran:audio:timings -- `
  --surah-json C:\data\qul-husary\surah.json `
  --segments-json C:\data\qul-husary\segments.json `
  --reference-audio C:\data\qul-husary\mp3 `
  --audio-manifest reports\audio\mahmoud-khalil-al-hosary.juz-amma.json `
  --frontend-output src\features\quran\fixtures\juz-amma.audio-timings.json
```

The generated manifest contains only public asset URLs and `startMs`/`endMs`; it does not contain Arabic text. Until this command succeeds, the child UI deliberately does not offer per-ayah playback or repeat controls.
