import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { z } from "zod";
import { type QuranAudioEntry, updateDatasetChecksum } from "./dataset";

export const JUZ_AMMA_SURAH_NUMBERS = Array.from({ length: 37 }, (_, index) => index + 78);

const timingReadSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  rewaya: z.string().min(1),
  folder_url: z.string().url(),
});

const timingSchema = z.array(z.object({ ayah: z.number().int().nonnegative(), start_time: z.number().int().nonnegative(), end_time: z.number().int().positive() }));

type FetchResponse = {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
  arrayBuffer(): Promise<ArrayBuffer>;
  headers: { get(name: string): string | null };
};

export type FetchFn = (url: string) => Promise<FetchResponse>;

const MAX_AUDIO_BYTES = 64 * 1024 * 1024;

async function jsonFrom<T>(fetchFn: FetchFn, url: string, schema: z.ZodType<T>): Promise<T> {
  const response = await fetchFn(url);
  if (!response.ok) throw new Error(`MP3Quran request failed (${response.status}) for ${url}`);
  return schema.parse(await response.json());
}

async function checksumFromAsset(fetchFn: FetchFn, assetUrl: string): Promise<string> {
  const response = await fetchFn(assetUrl);
  if (!response.ok) throw new Error(`MP3Quran audio request failed (${response.status}) for ${assetUrl}`);
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_AUDIO_BYTES) {
    throw new Error(`MP3Quran asset exceeds ${MAX_AUDIO_BYTES} bytes: ${assetUrl}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength > MAX_AUDIO_BYTES) throw new Error(`MP3Quran asset exceeds ${MAX_AUDIO_BYTES} bytes: ${assetUrl}`);
  return createHash("sha256").update(bytes).digest("hex");
}

function parseVerseKey(verseKey: string): { surahNumber: number; ayahNumber: number } {
  const match = verseKey.match(/^(\d{1,3}):(\d{1,3})$/);
  if (!match) throw new Error(`Invalid verse key in local dataset: ${verseKey}`);
  return { surahNumber: Number(match[1]), ayahNumber: Number(match[2]) };
}

export async function createMp3QuranJuzAmmaAudio(
  readId: number,
  verseKeys: string[],
  fetchFn: FetchFn = fetch,
): Promise<QuranAudioEntry[]> {
  const reads = await jsonFrom(fetchFn, "https://mp3quran.net/api/v3/ayat_timing/reads", z.array(timingReadSchema));
  const read = reads.find((item) => item.id === readId);
  if (!read) throw new Error(`MP3Quran timing read ${readId} was not found`);

  const requestedBySurah = new Map<number, number[]>();
  verseKeys.forEach((verseKey) => {
    const { surahNumber, ayahNumber } = parseVerseKey(verseKey);
    if (!JUZ_AMMA_SURAH_NUMBERS.includes(surahNumber)) throw new Error(`Verse ${verseKey} is outside Juz Amma`);
    const ayahs = requestedBySurah.get(surahNumber) ?? [];
    ayahs.push(ayahNumber);
    requestedBySurah.set(surahNumber, ayahs);
  });

  if (requestedBySurah.size !== JUZ_AMMA_SURAH_NUMBERS.length) {
    throw new Error("Local dataset must include every Juz Amma surah (78-114) before creating audio metadata");
  }

  const entries: QuranAudioEntry[] = [];
  for (const surahNumber of JUZ_AMMA_SURAH_NUMBERS) {
    const assetUrl = new URL(`${String(surahNumber).padStart(3, "0")}.mp3`, read.folder_url).toString();
    const timings = await jsonFrom(fetchFn, `https://mp3quran.net/api/v3/ayat_timing?surah=${surahNumber}&read=${readId}`, timingSchema);
    const timingByAyah = new Map(timings.filter((timing) => timing.ayah > 0).map((timing) => [timing.ayah, timing]));
    const durationMs = Math.max(...timings.map((timing) => timing.end_time));
    const checksum = await checksumFromAsset(fetchFn, assetUrl);

    (requestedBySurah.get(surahNumber) ?? []).sort((left, right) => left - right).forEach((ayahNumber) => {
      const timing = timingByAyah.get(ayahNumber);
      if (!timing || timing.end_time <= timing.start_time) {
        throw new Error(`MP3Quran timing is missing or invalid for ${surahNumber}:${ayahNumber}`);
      }
      entries.push({
        verseKey: `${surahNumber}:${ayahNumber}`,
        reciter: {
          name: read.name,
          source: "MP3Quran.net",
          licenseNote: "MP3Quran.net streaming URL; source metadata collected by the Hafalku importer.",
        },
        assetUrl,
        durationMs,
        startMs: timing.start_time,
        endMs: timing.end_time,
        checksum,
      });
    });
  }

  return entries;
}

export async function writeMp3QuranAudio(datasetDirectory: string, currentAudio: QuranAudioEntry[], generatedAudio: QuranAudioEntry[]): Promise<string> {
  const generatedKeys = new Set(generatedAudio.map((entry) => `${entry.verseKey}\0${entry.reciter.name}\0${entry.reciter.source}`));
  const mergedAudio = [...currentAudio.filter((entry) => !generatedKeys.has(`${entry.verseKey}\0${entry.reciter.name}\0${entry.reciter.source}`)), ...generatedAudio];
  const audioPath = join(resolve(datasetDirectory), "audio.json");
  await writeFile(audioPath, `${JSON.stringify(mergedAudio, null, 2)}\n`, "utf8");
  await updateDatasetChecksum(datasetDirectory, "audio.json");
  return audioPath;
}
