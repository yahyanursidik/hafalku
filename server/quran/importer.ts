import { randomUUID } from "node:crypto";
import { getSqlConnection } from "../db/client";
import { hashContent, type QuranDataset } from "./dataset";
import type { QuranValidationReport } from "./validate";

type ImportResult = {
  datasetVersion: string;
  datasetId: string;
  status: "REVIEW_REQUIRED";
  contentHash: string;
};

function requiredValidReport(report: QuranValidationReport): void {
  if (!report.valid) {
    throw new Error(`Dataset ${report.datasetVersion} failed validation; import was not attempted`);
  }
}

export async function importQuranDataset(dataset: QuranDataset, report: QuranValidationReport): Promise<ImportResult> {
  requiredValidReport(report);

  const database = getSqlConnection();
  const datasetId = randomUUID();
  const surahIds = new Map(dataset.surahs.map((surah) => [surah.surahNumber, randomUUID()]));
  const verseIds = new Map(dataset.verses.map((verse) => [verse.verseKey, randomUUID()]));
  const translationId = randomUUID();
  const reciterIds = new Map<string, string>();
  dataset.audio.forEach((audio) => {
    const key = `${audio.reciter.name}\0${audio.reciter.source}`;
    if (!reciterIds.has(key)) reciterIds.set(key, randomUUID());
  });

  await database.transaction((sql) => [
    sql`select set_config('hafalku.quran_importer', 'on', true)`,
    sql`insert into quran_dataset_versions (id, version, source_name, source_version, content_hash, status)
        values (${datasetId}, ${dataset.metadata.version}, ${dataset.metadata.sourceName}, ${dataset.metadata.sourceVersion ?? null}, ${dataset.contentHash}, 'REVIEW_REQUIRED')`,
    ...dataset.surahs.map((surah) =>
      sql`insert into quran_surahs (id, dataset_version_id, surah_number, name_ar, name_id, ayah_count, revelation_type)
          values (${surahIds.get(surah.surahNumber)!}, ${datasetId}, ${surah.surahNumber}, ${surah.nameAr}, ${surah.nameId}, ${surah.ayahCount}, ${surah.revelationType})`,
    ),
    ...dataset.verses.map((verse) =>
      sql`insert into quran_verses (id, dataset_version_id, surah_id, ayah_number, verse_key, text_uthmani, text_imlaei, content_hash)
          values (${verseIds.get(verse.verseKey)!}, ${datasetId}, ${surahIds.get(verse.surahNumber)!}, ${verse.ayahNumber}, ${verse.verseKey}, ${verse.textUthmani}, ${verse.textImlaei ?? null}, ${hashContent(verse.textUthmani)})`,
    ),
    ...dataset.words.map((word) =>
      sql`insert into quran_words (id, verse_id, position, text_arabic)
          values (${randomUUID()}, ${verseIds.get(word.verseKey)!}, ${word.position}, ${word.textArabic})`,
    ),
    sql`insert into quran_translations (id, language, title, source, edition)
        values (${translationId}, ${dataset.translations.language}, ${dataset.translations.title}, ${dataset.translations.source}, ${dataset.translations.edition})`,
    ...dataset.translations.verses.map((translation) =>
      sql`insert into verse_translations (id, verse_id, translation_id, text)
          values (${randomUUID()}, ${verseIds.get(translation.verseKey)!}, ${translationId}, ${translation.text})`,
    ),
    ...dataset.transliterations.verses.map((transliteration) =>
      sql`insert into verse_transliterations (id, verse_id, language, text, source, version, status)
          values (${randomUUID()}, ${verseIds.get(transliteration.verseKey)!}, ${dataset.transliterations.language}, ${transliteration.text}, ${dataset.transliterations.source}, ${dataset.transliterations.version}, ${dataset.transliterations.status})`,
    ),
    ...[...reciterIds.entries()].map(([key, reciterId]) => {
      const audio = dataset.audio.find((item) => `${item.reciter.name}\0${item.reciter.source}` === key)!;
      return sql`insert into quran_reciters (id, name, source, license_note)
        values (${reciterId}, ${audio.reciter.name}, ${audio.reciter.source}, ${audio.reciter.licenseNote})`;
    }),
    ...dataset.audio.map((audio) => {
      const reciterId = reciterIds.get(`${audio.reciter.name}\0${audio.reciter.source}`)!;
      return sql`insert into quran_audio (id, verse_id, reciter_id, asset_url, duration_ms, start_ms, end_ms, checksum)
        values (${randomUUID()}, ${verseIds.get(audio.verseKey)!}, ${reciterId}, ${audio.assetUrl}, ${audio.durationMs}, ${audio.startMs ?? null}, ${audio.endMs ?? null}, ${audio.checksum})`;
    }),
  ]);

  return { datasetVersion: dataset.metadata.version, datasetId, status: "REVIEW_REQUIRED", contentHash: dataset.contentHash };
}

export async function activateQuranDataset(version: string): Promise<{ datasetVersion: string; status: "ACTIVE" }> {
  const database = getSqlConnection();
  const results = await database.transaction((sql) => [
    sql`select set_config('hafalku.quran_importer', 'on', true)`,
    sql`with candidate as (
          select id from quran_dataset_versions where version = ${version} and status = 'VERIFIED'
        ), demoted as (
          update quran_dataset_versions
          set status = 'VERIFIED'
          where status = 'ACTIVE' and exists (select 1 from candidate)
        )
        update quran_dataset_versions
        set status = 'ACTIVE', activated_at = now()
        where id = (select id from candidate)
        returning version`,
  ]);

  const activated = results[1] as unknown as { version: string }[];
  if (!activated[0]) {
    throw new Error(`Dataset ${version} was not activated: it must exist and be VERIFIED`);
  }

  return { datasetVersion: version, status: "ACTIVE" };
}
