CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "quran_dataset_status" AS ENUM ('IMPORTED', 'VALIDATING', 'REVIEW_REQUIRED', 'VERIFIED', 'ACTIVE', 'REJECTED');
CREATE TYPE "quran_revelation_type" AS ENUM ('MAKKI', 'MADANI');
CREATE TYPE "transliteration_status" AS ENUM ('DRAFT', 'REVIEW_REQUIRED', 'APPROVED', 'REJECTED');

CREATE TABLE "quran_dataset_versions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "version" text NOT NULL,
  "source_name" text NOT NULL,
  "source_version" text,
  "content_hash" text NOT NULL,
  "status" "quran_dataset_status" DEFAULT 'IMPORTED' NOT NULL,
  "imported_at" timestamp with time zone DEFAULT now() NOT NULL,
  "verified_at" timestamp with time zone,
  "verified_by" text,
  "activated_at" timestamp with time zone,
  CONSTRAINT "quran_dataset_versions_version_not_empty" CHECK (length(trim("version")) > 0)
);
CREATE UNIQUE INDEX "quran_dataset_versions_version_unique" ON "quran_dataset_versions" USING btree ("version");
CREATE UNIQUE INDEX "quran_dataset_versions_content_hash_unique" ON "quran_dataset_versions" USING btree ("content_hash");
CREATE INDEX "quran_dataset_versions_status_index" ON "quran_dataset_versions" USING btree ("status");

CREATE TABLE "quran_surahs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "dataset_version_id" uuid NOT NULL,
  "surah_number" integer NOT NULL,
  "name_ar" text NOT NULL,
  "name_id" text NOT NULL,
  "ayah_count" integer NOT NULL,
  "revelation_type" "quran_revelation_type" NOT NULL,
  CONSTRAINT "quran_surahs_number_range" CHECK ("surah_number" between 1 and 114),
  CONSTRAINT "quran_surahs_ayah_count_positive" CHECK ("ayah_count" > 0),
  CONSTRAINT "quran_surahs_dataset_version_id_quran_dataset_versions_id_fk" FOREIGN KEY ("dataset_version_id") REFERENCES "quran_dataset_versions"("id") ON DELETE RESTRICT
);
CREATE UNIQUE INDEX "quran_surahs_dataset_number_unique" ON "quran_surahs" USING btree ("dataset_version_id", "surah_number");
CREATE UNIQUE INDEX "quran_surahs_id_dataset_unique" ON "quran_surahs" USING btree ("id", "dataset_version_id");

CREATE TABLE "quran_verses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "dataset_version_id" uuid NOT NULL,
  "surah_id" uuid NOT NULL,
  "ayah_number" integer NOT NULL,
  "verse_key" text NOT NULL,
  "text_uthmani" text NOT NULL,
  "text_imlaei" text,
  "content_hash" text NOT NULL,
  CONSTRAINT "quran_verses_ayah_number_positive" CHECK ("ayah_number" > 0),
  CONSTRAINT "quran_verses_uthmani_not_empty" CHECK (length(trim("text_uthmani")) > 0),
  CONSTRAINT "quran_verses_dataset_version_id_quran_dataset_versions_id_fk" FOREIGN KEY ("dataset_version_id") REFERENCES "quran_dataset_versions"("id") ON DELETE RESTRICT,
  CONSTRAINT "quran_verses_surah_dataset_fk" FOREIGN KEY ("surah_id", "dataset_version_id") REFERENCES "quran_surahs"("id", "dataset_version_id") ON DELETE RESTRICT
);
CREATE UNIQUE INDEX "quran_verses_dataset_verse_key_unique" ON "quran_verses" USING btree ("dataset_version_id", "verse_key");
CREATE UNIQUE INDEX "quran_verses_surah_ayah_unique" ON "quran_verses" USING btree ("surah_id", "ayah_number");
CREATE INDEX "quran_verses_dataset_surah_index" ON "quran_verses" USING btree ("dataset_version_id", "surah_id");

CREATE TABLE "quran_words" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "verse_id" uuid NOT NULL,
  "position" integer NOT NULL,
  "text_arabic" text NOT NULL,
  CONSTRAINT "quran_words_position_positive" CHECK ("position" > 0),
  CONSTRAINT "quran_words_text_not_empty" CHECK (length(trim("text_arabic")) > 0),
  CONSTRAINT "quran_words_verse_id_quran_verses_id_fk" FOREIGN KEY ("verse_id") REFERENCES "quran_verses"("id") ON DELETE RESTRICT
);
CREATE UNIQUE INDEX "quran_words_verse_position_unique" ON "quran_words" USING btree ("verse_id", "position");

CREATE TABLE "quran_translations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "language" text NOT NULL,
  "title" text NOT NULL,
  "source" text NOT NULL,
  "edition" text NOT NULL
);
CREATE UNIQUE INDEX "quran_translations_source_edition_unique" ON "quran_translations" USING btree ("language", "source", "edition");

CREATE TABLE "verse_translations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "verse_id" uuid NOT NULL,
  "translation_id" uuid NOT NULL,
  "text" text NOT NULL,
  CONSTRAINT "verse_translations_text_not_empty" CHECK (length(trim("text")) > 0),
  CONSTRAINT "verse_translations_verse_id_quran_verses_id_fk" FOREIGN KEY ("verse_id") REFERENCES "quran_verses"("id") ON DELETE RESTRICT,
  CONSTRAINT "verse_translations_translation_id_quran_translations_id_fk" FOREIGN KEY ("translation_id") REFERENCES "quran_translations"("id") ON DELETE RESTRICT
);
CREATE UNIQUE INDEX "verse_translations_verse_translation_unique" ON "verse_translations" USING btree ("verse_id", "translation_id");

CREATE TABLE "verse_transliterations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "verse_id" uuid NOT NULL,
  "language" text NOT NULL,
  "text" text NOT NULL,
  "source" text NOT NULL,
  "version" text NOT NULL,
  "status" "transliteration_status" DEFAULT 'DRAFT' NOT NULL,
  "reviewed_by" text,
  "reviewed_at" timestamp with time zone,
  CONSTRAINT "verse_transliterations_text_not_empty" CHECK (length(trim("text")) > 0),
  CONSTRAINT "verse_transliterations_verse_id_quran_verses_id_fk" FOREIGN KEY ("verse_id") REFERENCES "quran_verses"("id") ON DELETE RESTRICT
);
CREATE UNIQUE INDEX "verse_transliterations_version_unique" ON "verse_transliterations" USING btree ("verse_id", "language", "version");

CREATE TABLE "quran_reciters" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "source" text NOT NULL,
  "license_note" text NOT NULL
);
CREATE UNIQUE INDEX "quran_reciters_name_source_unique" ON "quran_reciters" USING btree ("name", "source");

CREATE TABLE "quran_audio" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "verse_id" uuid NOT NULL,
  "reciter_id" uuid NOT NULL,
  "asset_url" text NOT NULL,
  "duration_ms" integer NOT NULL,
  "checksum" text NOT NULL,
  CONSTRAINT "quran_audio_duration_positive" CHECK ("duration_ms" > 0),
  CONSTRAINT "quran_audio_verse_id_quran_verses_id_fk" FOREIGN KEY ("verse_id") REFERENCES "quran_verses"("id") ON DELETE RESTRICT,
  CONSTRAINT "quran_audio_reciter_id_quran_reciters_id_fk" FOREIGN KEY ("reciter_id") REFERENCES "quran_reciters"("id") ON DELETE RESTRICT
);
CREATE UNIQUE INDEX "quran_audio_verse_reciter_unique" ON "quran_audio" USING btree ("verse_id", "reciter_id");

-- Quran Core is write-protected for application requests. Phase B2's importer
-- will set this transaction-local flag before creating a new dataset version.
CREATE OR REPLACE FUNCTION "require_quran_importer_context"() RETURNS trigger AS $$
BEGIN
  IF current_setting('hafalku.quran_importer', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'Quran Core may only be changed by the dataset importer';
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "quran_dataset_versions_importer_only" BEFORE INSERT OR UPDATE OR DELETE ON "quran_dataset_versions" FOR EACH ROW EXECUTE FUNCTION "require_quran_importer_context"();
CREATE TRIGGER "quran_surahs_importer_only" BEFORE INSERT OR UPDATE OR DELETE ON "quran_surahs" FOR EACH ROW EXECUTE FUNCTION "require_quran_importer_context"();
CREATE TRIGGER "quran_verses_importer_only" BEFORE INSERT OR UPDATE OR DELETE ON "quran_verses" FOR EACH ROW EXECUTE FUNCTION "require_quran_importer_context"();
CREATE TRIGGER "quran_words_importer_only" BEFORE INSERT OR UPDATE OR DELETE ON "quran_words" FOR EACH ROW EXECUTE FUNCTION "require_quran_importer_context"();
CREATE TRIGGER "quran_translations_importer_only" BEFORE INSERT OR UPDATE OR DELETE ON "quran_translations" FOR EACH ROW EXECUTE FUNCTION "require_quran_importer_context"();
CREATE TRIGGER "verse_translations_importer_only" BEFORE INSERT OR UPDATE OR DELETE ON "verse_translations" FOR EACH ROW EXECUTE FUNCTION "require_quran_importer_context"();
CREATE TRIGGER "verse_transliterations_importer_only" BEFORE INSERT OR UPDATE OR DELETE ON "verse_transliterations" FOR EACH ROW EXECUTE FUNCTION "require_quran_importer_context"();
CREATE TRIGGER "quran_reciters_importer_only" BEFORE INSERT OR UPDATE OR DELETE ON "quran_reciters" FOR EACH ROW EXECUTE FUNCTION "require_quran_importer_context"();
CREATE TRIGGER "quran_audio_importer_only" BEFORE INSERT OR UPDATE OR DELETE ON "quran_audio" FOR EACH ROW EXECUTE FUNCTION "require_quran_importer_context"();
