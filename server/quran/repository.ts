import { getSqlConnection } from "../db/client";

export type ActiveDataset = { id: string; version: string };
export type SurahRecord = {
  surahNumber: number;
  nameAr: string;
  nameId: string;
  ayahCount: number;
  revelationType: "MAKKI" | "MADANI";
};
export type VerseRecord = {
  verseKey: string;
  ayahNumber: number;
  textUthmani: string;
  textImlaei: string | null;
};
export type TranslationRecord = { language: string; title: string; source: string; edition: string; text: string };
export type TransliterationRecord = { language: string; text: string; source: string; version: string; status: string };
export type WordRecord = { position: number; textArabic: string };
export type AudioRecord = {
  assetUrl: string;
  durationMs: number;
  startMs: number | null;
  endMs: number | null;
  checksum: string;
  reciter: { name: string; source: string; licenseNote: string };
};

export interface QuranReadRepository {
  getActiveDataset(): Promise<ActiveDataset | undefined>;
  listSurahs(datasetId: string, offset: number, limit: number): Promise<{ rows: SurahRecord[]; total: number }>;
  findSurah(datasetId: string, surahNumber: number): Promise<SurahRecord | undefined>;
  findVerse(datasetId: string, verseKey: string): Promise<VerseRecord | undefined>;
  findTranslations(datasetId: string, verseKey: string): Promise<TranslationRecord[]>;
  findTransliterations(datasetId: string, verseKey: string): Promise<TransliterationRecord[]>;
  findWords(datasetId: string, verseKey: string): Promise<WordRecord[]>;
  findAudio(datasetId: string, verseKey: string): Promise<AudioRecord[]>;
}

type SqlRows = Record<string, unknown>[];

function numberValue(value: unknown): number {
  return typeof value === "number" ? value : Number(value);
}

export function createQuranReadRepository(): QuranReadRepository {
  const sql = getSqlConnection();

  return {
    async getActiveDataset() {
      const rows = (await sql`select id, version from quran_dataset_versions where status = 'ACTIVE' order by activated_at desc nulls last limit 1`) as SqlRows;
      const row = rows[0];
      return row ? { id: String(row.id), version: String(row.version) } : undefined;
    },
    async listSurahs(datasetId, offset, limit) {
      const [rows, totals] = (await Promise.all([
        sql`select surah_number, name_ar, name_id, ayah_count, revelation_type
            from quran_surahs where dataset_version_id = ${datasetId}
            order by surah_number offset ${offset} limit ${limit}`,
        sql`select count(*) as total from quran_surahs where dataset_version_id = ${datasetId}`,
      ])) as [SqlRows, SqlRows];
      return {
        rows: rows.map((row) => ({
          surahNumber: numberValue(row.surah_number),
          nameAr: String(row.name_ar),
          nameId: String(row.name_id),
          ayahCount: numberValue(row.ayah_count),
          revelationType: row.revelation_type as SurahRecord["revelationType"],
        })),
        total: numberValue(totals[0]?.total ?? 0),
      };
    },
    async findSurah(datasetId, surahNumber) {
      const rows = (await sql`select surah_number, name_ar, name_id, ayah_count, revelation_type
          from quran_surahs where dataset_version_id = ${datasetId} and surah_number = ${surahNumber} limit 1`) as SqlRows;
      const row = rows[0];
      return row
        ? {
            surahNumber: numberValue(row.surah_number), nameAr: String(row.name_ar), nameId: String(row.name_id),
            ayahCount: numberValue(row.ayah_count), revelationType: row.revelation_type as SurahRecord["revelationType"],
          }
        : undefined;
    },
    async findVerse(datasetId, verseKey) {
      const rows = (await sql`select verse_key, ayah_number, text_uthmani, text_imlaei
          from quran_verses where dataset_version_id = ${datasetId} and verse_key = ${verseKey} limit 1`) as SqlRows;
      const row = rows[0];
      return row
        ? { verseKey: String(row.verse_key), ayahNumber: numberValue(row.ayah_number), textUthmani: String(row.text_uthmani), textImlaei: row.text_imlaei === null ? null : String(row.text_imlaei) }
        : undefined;
    },
    async findTranslations(datasetId, verseKey) {
      const rows = (await sql`select t.language, t.title, t.source, t.edition, vt.text
          from verse_translations vt join quran_translations t on t.id = vt.translation_id
          join quran_verses v on v.id = vt.verse_id
          where v.dataset_version_id = ${datasetId} and v.verse_key = ${verseKey}
          order by t.language, t.title`) as SqlRows;
      return rows.map((row) => ({ language: String(row.language), title: String(row.title), source: String(row.source), edition: String(row.edition), text: String(row.text) }));
    },
    async findTransliterations(datasetId, verseKey) {
      const rows = (await sql`select vt.language, vt.text, vt.source, vt.version, vt.status
          from verse_transliterations vt join quran_verses v on v.id = vt.verse_id
          where v.dataset_version_id = ${datasetId} and v.verse_key = ${verseKey}
          order by vt.language, vt.version`) as SqlRows;
      return rows.map((row) => ({ language: String(row.language), text: String(row.text), source: String(row.source), version: String(row.version), status: String(row.status) }));
    },
    async findWords(datasetId, verseKey) {
      const rows = (await sql`select w.position, w.text_arabic from quran_words w
          join quran_verses v on v.id = w.verse_id
          where v.dataset_version_id = ${datasetId} and v.verse_key = ${verseKey}
          order by w.position`) as SqlRows;
      return rows.map((row) => ({ position: numberValue(row.position), textArabic: String(row.text_arabic) }));
    },
    async findAudio(datasetId, verseKey) {
      const rows = (await sql`select a.asset_url, a.duration_ms, a.start_ms, a.end_ms, a.checksum, r.name, r.source, r.license_note
          from quran_audio a join quran_reciters r on r.id = a.reciter_id
          join quran_verses v on v.id = a.verse_id
          where v.dataset_version_id = ${datasetId} and v.verse_key = ${verseKey}
          order by r.name`) as SqlRows;
      return rows.map((row) => ({
        assetUrl: String(row.asset_url), durationMs: numberValue(row.duration_ms),
        startMs: row.start_ms === null ? null : numberValue(row.start_ms), endMs: row.end_ms === null ? null : numberValue(row.end_ms), checksum: String(row.checksum),
        reciter: { name: String(row.name), source: String(row.source), licenseNote: String(row.license_note) },
      }));
    },
  };
}
