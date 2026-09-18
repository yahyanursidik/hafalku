import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const quranDatasetStatus = pgEnum("quran_dataset_status", [
  "IMPORTED",
  "VALIDATING",
  "REVIEW_REQUIRED",
  "VERIFIED",
  "ACTIVE",
  "REJECTED",
]);

export const quranRevelationType = pgEnum("quran_revelation_type", ["MAKKI", "MADANI"]);

export const transliterationStatus = pgEnum("transliteration_status", [
  "DRAFT",
  "REVIEW_REQUIRED",
  "APPROVED",
  "REJECTED",
]);

export const quranDatasetVersions = pgTable(
  "quran_dataset_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    version: text("version").notNull(),
    sourceName: text("source_name").notNull(),
    sourceVersion: text("source_version"),
    contentHash: text("content_hash").notNull(),
    status: quranDatasetStatus("status").notNull().default("IMPORTED"),
    importedAt: timestamp("imported_at", { withTimezone: true }).notNull().defaultNow(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    verifiedBy: text("verified_by"),
    activatedAt: timestamp("activated_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("quran_dataset_versions_version_unique").on(table.version),
    uniqueIndex("quran_dataset_versions_content_hash_unique").on(table.contentHash),
    index("quran_dataset_versions_status_index").on(table.status),
    check("quran_dataset_versions_version_not_empty", sql`length(trim(${table.version})) > 0`),
  ],
);

export const quranSurahs = pgTable(
  "quran_surahs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    datasetVersionId: uuid("dataset_version_id")
      .notNull()
      .references(() => quranDatasetVersions.id, { onDelete: "restrict" }),
    surahNumber: integer("surah_number").notNull(),
    nameAr: text("name_ar").notNull(),
    nameId: text("name_id").notNull(),
    ayahCount: integer("ayah_count").notNull(),
    revelationType: quranRevelationType("revelation_type").notNull(),
  },
  (table) => [
    uniqueIndex("quran_surahs_dataset_number_unique").on(table.datasetVersionId, table.surahNumber),
    uniqueIndex("quran_surahs_id_dataset_unique").on(table.id, table.datasetVersionId),
    check("quran_surahs_number_range", sql`${table.surahNumber} between 1 and 114`),
    check("quran_surahs_ayah_count_positive", sql`${table.ayahCount} > 0`),
  ],
);

export const quranVerses = pgTable(
  "quran_verses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    datasetVersionId: uuid("dataset_version_id")
      .notNull()
      .references(() => quranDatasetVersions.id, { onDelete: "restrict" }),
    surahId: uuid("surah_id").notNull(),
    ayahNumber: integer("ayah_number").notNull(),
    verseKey: text("verse_key").notNull(),
    textUthmani: text("text_uthmani").notNull(),
    textImlaei: text("text_imlaei"),
    contentHash: text("content_hash").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.surahId, table.datasetVersionId],
      foreignColumns: [quranSurahs.id, quranSurahs.datasetVersionId],
      name: "quran_verses_surah_dataset_fk",
    }).onDelete("restrict"),
    uniqueIndex("quran_verses_dataset_verse_key_unique").on(table.datasetVersionId, table.verseKey),
    uniqueIndex("quran_verses_surah_ayah_unique").on(table.surahId, table.ayahNumber),
    index("quran_verses_dataset_surah_index").on(table.datasetVersionId, table.surahId),
    check("quran_verses_ayah_number_positive", sql`${table.ayahNumber} > 0`),
    check("quran_verses_uthmani_not_empty", sql`length(trim(${table.textUthmani})) > 0`),
  ],
);

export const quranWords = pgTable(
  "quran_words",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    verseId: uuid("verse_id")
      .notNull()
      .references(() => quranVerses.id, { onDelete: "restrict" }),
    position: integer("position").notNull(),
    textArabic: text("text_arabic").notNull(),
  },
  (table) => [
    uniqueIndex("quran_words_verse_position_unique").on(table.verseId, table.position),
    check("quran_words_position_positive", sql`${table.position} > 0`),
    check("quran_words_text_not_empty", sql`length(trim(${table.textArabic})) > 0`),
  ],
);

export const quranTranslations = pgTable(
  "quran_translations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    language: text("language").notNull(),
    title: text("title").notNull(),
    source: text("source").notNull(),
    edition: text("edition").notNull(),
  },
  (table) => [uniqueIndex("quran_translations_source_edition_unique").on(table.language, table.source, table.edition)],
);

export const verseTranslations = pgTable(
  "verse_translations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    verseId: uuid("verse_id")
      .notNull()
      .references(() => quranVerses.id, { onDelete: "restrict" }),
    translationId: uuid("translation_id")
      .notNull()
      .references(() => quranTranslations.id, { onDelete: "restrict" }),
    text: text("text").notNull(),
  },
  (table) => [
    uniqueIndex("verse_translations_verse_translation_unique").on(table.verseId, table.translationId),
    check("verse_translations_text_not_empty", sql`length(trim(${table.text})) > 0`),
  ],
);

export const verseTransliterations = pgTable(
  "verse_transliterations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    verseId: uuid("verse_id")
      .notNull()
      .references(() => quranVerses.id, { onDelete: "restrict" }),
    language: text("language").notNull(),
    text: text("text").notNull(),
    source: text("source").notNull(),
    version: text("version").notNull(),
    status: transliterationStatus("status").notNull().default("DRAFT"),
    reviewedBy: text("reviewed_by"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("verse_transliterations_version_unique").on(table.verseId, table.language, table.version),
    check("verse_transliterations_text_not_empty", sql`length(trim(${table.text})) > 0`),
  ],
);

export const quranReciters = pgTable(
  "quran_reciters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    source: text("source").notNull(),
    licenseNote: text("license_note").notNull(),
  },
  (table) => [uniqueIndex("quran_reciters_name_source_unique").on(table.name, table.source)],
);

export const quranAudio = pgTable(
  "quran_audio",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    verseId: uuid("verse_id")
      .notNull()
      .references(() => quranVerses.id, { onDelete: "restrict" }),
    reciterId: uuid("reciter_id")
      .notNull()
      .references(() => quranReciters.id, { onDelete: "restrict" }),
    assetUrl: text("asset_url").notNull(),
    durationMs: integer("duration_ms").notNull(),
    startMs: integer("start_ms"),
    endMs: integer("end_ms"),
    checksum: text("checksum").notNull(),
  },
  (table) => [
    uniqueIndex("quran_audio_verse_reciter_unique").on(table.verseId, table.reciterId),
    check("quran_audio_duration_positive", sql`${table.durationMs} > 0`),
    check("quran_audio_time_range", sql`(${table.startMs} is null and ${table.endMs} is null) or (${table.startMs} >= 0 and ${table.endMs} > ${table.startMs} and ${table.endMs} <= ${table.durationMs})`),
  ],
);

export const quranCoreTableNames = [
  "quran_dataset_versions",
  "quran_surahs",
  "quran_verses",
  "quran_words",
  "quran_translations",
  "verse_translations",
  "verse_transliterations",
  "quran_reciters",
  "quran_audio",
] as const;
