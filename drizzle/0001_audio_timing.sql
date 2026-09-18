ALTER TABLE "quran_audio" ADD COLUMN "start_ms" integer;
ALTER TABLE "quran_audio" ADD COLUMN "end_ms" integer;
ALTER TABLE "quran_audio" ADD CONSTRAINT "quran_audio_time_range"
  CHECK (("start_ms" IS NULL AND "end_ms" IS NULL) OR ("start_ms" >= 0 AND "end_ms" > "start_ms" AND "end_ms" <= "duration_ms"));
