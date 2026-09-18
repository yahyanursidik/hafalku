import { z } from "zod";
import { AppError } from "../http/errors";
import type { QuranReadRepository } from "./repository";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const surahNumberSchema = z.coerce.number().int().min(1).max(114);
const verseKeySchema = z.string().regex(/^\d{1,3}:\d{1,3}$/, "Invalid verse key");

async function activeDataset(repository: QuranReadRepository) {
  const dataset = await repository.getActiveDataset();
  if (!dataset) throw new AppError("QURAN_DATASET_UNAVAILABLE", "No active Quran dataset is available", 503);
  return dataset;
}

function notFound(resource: string): never {
  throw new AppError("QURAN_RESOURCE_NOT_FOUND", `${resource} was not found`, 404);
}

export async function listSurahs(repository: QuranReadRepository, input: unknown) {
  const { page, limit } = paginationSchema.parse(input);
  const dataset = await activeDataset(repository);
  const { rows, total } = await repository.listSurahs(dataset.id, (page - 1) * limit, limit);
  return { data: rows, meta: { datasetVersion: dataset.version, page, limit, total } };
}

export async function getSurah(repository: QuranReadRepository, input: unknown) {
  const surahNumber = surahNumberSchema.parse(input);
  const dataset = await activeDataset(repository);
  const surah = await repository.findSurah(dataset.id, surahNumber);
  if (!surah) notFound("Surah");
  return { data: surah, meta: { datasetVersion: dataset.version } };
}

export async function getVerse(repository: QuranReadRepository, input: unknown) {
  const verseKey = verseKeySchema.parse(input);
  const dataset = await activeDataset(repository);
  const verse = await repository.findVerse(dataset.id, verseKey);
  if (!verse) notFound("Verse");
  const [translations, transliterations] = await Promise.all([
    repository.findTranslations(dataset.id, verseKey), repository.findTransliterations(dataset.id, verseKey),
  ]);
  return { data: { ...verse, translations, transliterations }, meta: { datasetVersion: dataset.version } };
}

export async function getVerseWords(repository: QuranReadRepository, input: unknown) {
  const verseKey = verseKeySchema.parse(input);
  const dataset = await activeDataset(repository);
  const verse = await repository.findVerse(dataset.id, verseKey);
  if (!verse) notFound("Verse");
  return { data: await repository.findWords(dataset.id, verseKey), meta: { datasetVersion: dataset.version, verseKey } };
}

export async function getVerseAudio(repository: QuranReadRepository, input: unknown) {
  const verseKey = verseKeySchema.parse(input);
  const dataset = await activeDataset(repository);
  const verse = await repository.findVerse(dataset.id, verseKey);
  if (!verse) notFound("Verse");
  return { data: await repository.findAudio(dataset.id, verseKey), meta: { datasetVersion: dataset.version, verseKey } };
}
