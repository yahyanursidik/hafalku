import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { z } from "zod";
import { JUZ_AMMA_SURAH_NUMBERS, type AudioUploadManifest } from "./contabo";

const QUL_RECITATION_ID = 6;
const QUL_AUDIO_PREFIX = "https://audio-cdn.tarteel.ai/quran/surah/husary/murattal/mp3/";

// These counts are structural metadata only. Arabic text remains outside this workflow.
const JUZ_AMMA_AYAH_COUNTS: Record<number, number> = {
  78: 40, 79: 46, 80: 42, 81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17,
  87: 19, 88: 26, 89: 30, 90: 20, 91: 15, 92: 21, 93: 11, 94: 8, 95: 8,
  96: 19, 97: 5, 98: 8, 99: 8, 100: 11, 101: 11, 102: 8, 103: 3, 104: 9,
  105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3, 111: 5, 112: 4, 113: 5,
  114: 6,
};

const audioManifestSchema = z.object({
  manifestVersion: z.literal(1),
  scope: z.literal("Juz Amma (78-114)"),
  reciter: z.object({ name: z.string(), riwayah: z.string(), style: z.string(), source: z.string(), licenseNote: z.string() }),
  files: z.array(z.object({
    surahNumber: z.number().int().min(78).max(114),
    publicUrl: z.string().url(),
    checksumSha256: z.string().regex(/^[a-f0-9]{64}$/),
  })),
});

const qulSurahSchema = z.record(z.string(), z.object({
  surah_number: z.number().int().min(1).max(114),
  audio_url: z.string().url(),
  duration: z.number().positive(),
}));

const qulSegmentsSchema = z.record(z.string().regex(/^\d{1,3}:\d{1,3}$/), z.object({
  timestamp_from: z.number().int().nonnegative().optional(),
  timestamp_to: z.number().int().positive().optional(),
  time_from: z.number().int().nonnegative().optional(),
  time_to: z.number().int().positive().optional(),
  duration_ms: z.number().int().positive().optional(),
  segments: z.array(z.tuple([z.number().int().positive(), z.number().int().nonnegative(), z.number().int().positive()])).optional(),
}).transform((timing, context) => {
  const timestampFrom = timing.timestamp_from ?? timing.time_from;
  const timestampTo = timing.timestamp_to ?? timing.time_to;
  if (timestampFrom === undefined || timestampTo === undefined) {
    context.addIssue({ code: "custom", message: "Each QUL timing requires timestamp_from/timestamp_to or time_from/time_to." });
    return z.NEVER;
  }
  return { timestamp_from: timestampFrom, timestamp_to: timestampTo };
}));

export const verifiedVerseAudioTimingSchema = z.object({
  verseKey: z.string().regex(/^\d{1,3}:\d{1,3}$/),
  source: z.string().url(),
  startMs: z.number().int().nonnegative(),
  endMs: z.number().int().positive(),
});

export const verifiedAudioTimingManifestSchema = z.object({
  manifestVersion: z.literal(1),
  status: z.literal("VERIFIED"),
  scope: z.literal("Juz Amma (78-114)"),
  generatedAt: z.string().datetime(),
  contentHashSha256: z.string().regex(/^[a-f0-9]{64}$/),
  reciter: z.object({
    name: z.literal("Mahmoud Khalil Al Hosary"),
    riwayah: z.literal("Hafs 'an 'Asim"),
    style: z.literal("Murattal"),
    audioSource: z.literal("QUL/Tarteel"),
    timingSource: z.literal("QUL/Tarteel recitation 6"),
    verificationMethod: z.literal("byte-identical reference audio"),
  }),
  entries: z.array(verifiedVerseAudioTimingSchema),
});

export type VerifiedAudioTimingManifest = z.infer<typeof verifiedAudioTimingManifestSchema>;

function expectedFileName(surahNumber: number) {
  return `${String(surahNumber).padStart(3, "0")}.mp3`;
}

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(resolve(path), "utf8")) as unknown;
}

async function checksumsForDirectory(directoryPath: string): Promise<Map<number, string>> {
  const directory = resolve(directoryPath);
  const entries = await readdir(directory, { withFileTypes: true });
  const names = entries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".mp3")).map((entry) => entry.name).sort();
  const expected = JUZ_AMMA_SURAH_NUMBERS.map(expectedFileName);
  if (names.join("\0") !== expected.join("\0")) {
    throw new Error("Reference audio must contain exactly 078.mp3 through 114.mp3 and no other MP3 files.");
  }

  const results = await Promise.all(JUZ_AMMA_SURAH_NUMBERS.map(async (surahNumber) => {
    const bytes = await readFile(resolve(directory, expectedFileName(surahNumber)));
    return [surahNumber, createHash("sha256").update(bytes).digest("hex")] as const;
  }));
  return new Map(results);
}

function assertQulAudioUrl(surahNumber: number, audioUrl: string) {
  const expected = `${QUL_AUDIO_PREFIX}${expectedFileName(surahNumber)}`;
  if (audioUrl !== expected) {
    throw new Error(`QUL audio URL for surah ${surahNumber} must be ${expected}.`);
  }
}

function contentHash(entries: z.infer<typeof verifiedVerseAudioTimingSchema>[]): string {
  const canonical = entries.map((entry) => [entry.verseKey, entry.source, entry.startMs, entry.endMs]);
  return createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}

export async function createVerifiedJuzAmmaAudioTimingManifest(options: {
  surahJsonPath: string;
  segmentsJsonPath: string;
  referenceAudioDirectory: string;
  contaboAudioManifestPath: string;
  generatedAt?: Date;
}): Promise<VerifiedAudioTimingManifest> {
  const [rawSurahs, rawSegments, rawAudioManifest] = await Promise.all([
    readJson(options.surahJsonPath),
    readJson(options.segmentsJsonPath),
    readJson(options.contaboAudioManifestPath),
  ]);
  const surahs = qulSurahSchema.parse(rawSurahs);
  const segments = qulSegmentsSchema.parse(rawSegments);
  const audioManifest = audioManifestSchema.parse(rawAudioManifest) as Pick<AudioUploadManifest, "manifestVersion" | "scope" | "reciter" | "files">;
  const referenceChecksums = await checksumsForDirectory(options.referenceAudioDirectory);
  const audioBySurah = new Map(audioManifest.files.map((file) => [file.surahNumber, file]));

  if (audioManifest.files.length !== JUZ_AMMA_SURAH_NUMBERS.length) {
    throw new Error("Contabo audio manifest must include all 37 Juz Amma MP3 files.");
  }
  if (audioManifest.reciter.name !== "Mahmoud Khalil Al Hosary" || audioManifest.reciter.riwayah !== "Hafs 'an 'Asim" || audioManifest.reciter.style !== "Murattal") {
    throw new Error("Contabo audio manifest does not identify the approved Husary Hafs Murattal recording.");
  }

  const entries: z.infer<typeof verifiedVerseAudioTimingSchema>[] = [];
  for (const surahNumber of JUZ_AMMA_SURAH_NUMBERS) {
    const sourceSurah = surahs[String(surahNumber)];
    if (!sourceSurah || sourceSurah.surah_number !== surahNumber) throw new Error(`QUL data is missing surah ${surahNumber}.`);
    assertQulAudioUrl(surahNumber, sourceSurah.audio_url);
    const uploadedAudio = audioBySurah.get(surahNumber);
    if (!uploadedAudio) throw new Error(`Contabo audio manifest is missing surah ${surahNumber}.`);
    const referenceChecksum = referenceChecksums.get(surahNumber);
    if (uploadedAudio.checksumSha256 !== referenceChecksum) {
      throw new Error(`Contabo audio ${expectedFileName(surahNumber)} does not byte-match the QUL reference audio; timings will not be activated.`);
    }

    // QUL's API publishes a whole-second duration while its ayah timestamps retain
    // milliseconds. Permit only that documented sub-second rounding window.
    const durationLimit = Math.round((sourceSurah.duration + 1) * 1_000);
    for (let ayahNumber = 1; ayahNumber <= JUZ_AMMA_AYAH_COUNTS[surahNumber]; ayahNumber += 1) {
      const verseKey = `${surahNumber}:${ayahNumber}`;
      const timing = segments[verseKey];
      if (!timing) throw new Error(`QUL segments are missing verse ${verseKey}.`);
      if (timing.timestamp_to <= timing.timestamp_from || timing.timestamp_to > durationLimit) {
        throw new Error(`QUL timing is outside the audio duration for verse ${verseKey}.`);
      }
      entries.push(verifiedVerseAudioTimingSchema.parse({
        verseKey,
        source: uploadedAudio.publicUrl,
        startMs: timing.timestamp_from,
        endMs: timing.timestamp_to,
      }));
    }
  }

  return verifiedAudioTimingManifestSchema.parse({
    manifestVersion: 1,
    status: "VERIFIED",
    scope: "Juz Amma (78-114)",
    generatedAt: (options.generatedAt ?? new Date()).toISOString(),
    contentHashSha256: contentHash(entries),
    reciter: {
      name: "Mahmoud Khalil Al Hosary",
      riwayah: "Hafs 'an 'Asim",
      style: "Murattal",
      audioSource: "QUL/Tarteel",
      timingSource: `QUL/Tarteel recitation ${QUL_RECITATION_ID}`,
      verificationMethod: "byte-identical reference audio",
    },
    entries,
  });
}

export async function writeVerifiedAudioTimingManifest(path: string, manifest: VerifiedAudioTimingManifest): Promise<string> {
  const outputPath = resolve(path);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return outputPath;
}

export function describeTimingInputs() {
  return {
    recitation: "Mahmoud Khalil Al-Husary (Murattal), QUL/Tarteel resource 316 / recitation 6",
    requiredFiles: ["surah.json", "segments.json", "078.mp3 … 114.mp3"],
    note: "Reference MP3s must be the original QUL files. The importer refuses an activation when their SHA-256 hashes differ from the Contabo objects.",
  };
}
