import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { z } from "zod";

const revelationTypeSchema = z.enum(["MAKKI", "MADANI"]);
const verseKeySchema = z.string().regex(/^\d{1,3}:\d{1,3}$/);

const metadataSchema = z.object({
  version: z.string().min(1),
  sourceName: z.string().min(1),
  sourceVersion: z.string().min(1).optional(),
});

const surahSchema = z.object({
  surahNumber: z.number().int().positive(),
  nameAr: z.string().min(1),
  nameId: z.string().min(1),
  ayahCount: z.number().int().positive(),
  revelationType: revelationTypeSchema,
});

const verseSchema = z.object({
  verseKey: verseKeySchema,
  surahNumber: z.number().int().positive(),
  ayahNumber: z.number().int().positive(),
  textUthmani: z.string().min(1),
  textImlaei: z.string().min(1).optional(),
});

const wordSchema = z.object({
  verseKey: verseKeySchema,
  position: z.number().int().positive(),
  textArabic: z.string().min(1),
});

const translationFileSchema = z.object({
  language: z.string().min(1),
  title: z.string().min(1),
  source: z.string().min(1),
  edition: z.string().min(1),
  verses: z.array(z.object({ verseKey: verseKeySchema, text: z.string().min(1) })),
});

const transliterationFileSchema = z.object({
  language: z.string().min(1),
  source: z.string().min(1),
  version: z.string().min(1),
  status: z.enum(["DRAFT", "REVIEW_REQUIRED", "APPROVED", "REJECTED"]).default("REVIEW_REQUIRED"),
  verses: z.array(z.object({ verseKey: verseKeySchema, text: z.string().min(1) })),
});

const audioEntrySchema = z.object({
    verseKey: verseKeySchema,
    reciter: z.object({ name: z.string().min(1), source: z.string().min(1), licenseNote: z.string().min(1) }),
    assetUrl: z.string().url(),
    durationMs: z.number().int().positive(),
    startMs: z.number().int().nonnegative().optional(),
    endMs: z.number().int().positive().optional(),
    checksum: z.string().min(1),
  }).superRefine((audio, context) => {
    if ((audio.startMs === undefined) !== (audio.endMs === undefined)) {
      context.addIssue({ code: "custom", message: "Audio timing must include both startMs and endMs" });
    }
    if (audio.startMs !== undefined && audio.endMs !== undefined && (audio.endMs <= audio.startMs || audio.endMs > audio.durationMs)) {
      context.addIssue({ code: "custom", message: "Audio timing is outside the source asset duration" });
    }
  });

const audioFileSchema = z.array(audioEntrySchema);
export type QuranAudioEntry = z.infer<typeof audioEntrySchema>;

export type QuranDataset = {
  directory: string;
  metadata: z.infer<typeof metadataSchema>;
  surahs: z.infer<typeof surahSchema>[];
  verses: z.infer<typeof verseSchema>[];
  words: z.infer<typeof wordSchema>[];
  translations: z.infer<typeof translationFileSchema>;
  transliterations: z.infer<typeof transliterationFileSchema>;
  audio: z.infer<typeof audioFileSchema>;
  checksums: Map<string, string>;
  fileBytes: Map<string, Buffer>;
  contentHash: string;
};

export const requiredDatasetFiles = [
  "metadata.json",
  "surahs.json",
  "verses.json",
  "words.json",
  "translations-id.json",
  "transliterations-id.json",
  "SHA256SUMS",
] as const;

async function readJsonFile(directory: string, fileName: string): Promise<unknown> {
  const content = await readFile(join(directory, fileName), "utf8");
  return JSON.parse(content) as unknown;
}

function parseChecksums(rawChecksums: string): Map<string, string> {
  const parsed = new Map<string, string>();

  rawChecksums.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^([a-fA-F0-9]{64})\s+\*?(.+)$/);
    if (match) {
      parsed.set(basename(match[2]), match[1].toLowerCase());
    }
  });

  return parsed;
}

function hashDatasetFiles(fileBytes: Map<string, Buffer>): string {
  const hash = createHash("sha256");
  [...fileBytes.entries()]
    .filter(([fileName]) => fileName !== "SHA256SUMS")
    .sort(([left], [right]) => left.localeCompare(right))
    .forEach(([fileName, bytes]) => {
      hash.update(fileName);
      hash.update("\0");
      hash.update(bytes);
      hash.update("\0");
    });

  return hash.digest("hex");
}

export async function loadQuranDataset(datasetDirectory: string): Promise<QuranDataset> {
  const directory = resolve(datasetDirectory);
  const fileBytes = new Map<string, Buffer>();

  await Promise.all(
    requiredDatasetFiles.map(async (fileName) => {
      fileBytes.set(fileName, await readFile(join(directory, fileName)));
    }),
  );

  try {
    fileBytes.set("audio.json", await readFile(join(directory, "audio.json")));
  } catch (error) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") {
      throw error;
    }
  }

  const checksums = parseChecksums(fileBytes.get("SHA256SUMS")!.toString("utf8"));
  const metadata = metadataSchema.parse(await readJsonFile(directory, "metadata.json"));
  const surahs = z.array(surahSchema).parse(await readJsonFile(directory, "surahs.json"));
  const verses = z.array(verseSchema).parse(await readJsonFile(directory, "verses.json"));
  const words = z.array(wordSchema).parse(await readJsonFile(directory, "words.json"));
  const translations = translationFileSchema.parse(await readJsonFile(directory, "translations-id.json"));
  const transliterations = transliterationFileSchema.parse(await readJsonFile(directory, "transliterations-id.json"));
  const audio = fileBytes.has("audio.json") ? audioFileSchema.parse(await readJsonFile(directory, "audio.json")) : [];

  return {
    directory,
    metadata,
    surahs,
    verses,
    words,
    translations,
    transliterations,
    audio,
    checksums,
    fileBytes,
    contentHash: hashDatasetFiles(fileBytes),
  };
}

export function hashContent(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export async function updateDatasetChecksum(datasetDirectory: string, fileName: string): Promise<void> {
  const directory = resolve(datasetDirectory);
  const checksumsPath = join(directory, "SHA256SUMS");
  const checksums = parseChecksums(await readFile(checksumsPath, "utf8"));
  checksums.set(fileName, createHash("sha256").update(await readFile(join(directory, fileName))).digest("hex"));
  const content = [...checksums.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, checksum]) => `${checksum}  ${name}`)
    .join("\n");
  await writeFile(checksumsPath, `${content}\n`, "utf8");
}
