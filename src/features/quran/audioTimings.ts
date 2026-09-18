import timingManifest from "./fixtures/juz-amma.audio-timings.json";
import type { VerseAudio } from "./types";

type TimingEntry = {
  verseKey: string;
  source: string;
  startMs: number;
  endMs: number;
};

type TimingManifest = {
  manifestVersion: number;
  status: string;
  entries: TimingEntry[];
};

const manifest = timingManifest as TimingManifest;
const verifiedAudioByVerse = new Map<string, VerseAudio>(
  manifest.status === "VERIFIED"
    ? manifest.entries
      .filter((entry) => entry.startMs >= 0 && entry.endMs > entry.startMs)
      .map((entry) => [entry.verseKey, { source: entry.source, startMs: entry.startMs, endMs: entry.endMs }])
    : [],
);

export function getVerifiedVerseAudio(surahNumber: number, ayahNumber: number): VerseAudio | undefined {
  return verifiedAudioByVerse.get(`${surahNumber}:${ayahNumber}`);
}

export const isVerseAudioVerificationPending = manifest.status !== "VERIFIED";
