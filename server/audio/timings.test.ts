import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect } from "vitest";
import { JUZ_AMMA_SURAH_NUMBERS } from "./contabo";
import { createVerifiedJuzAmmaAudioTimingManifest } from "./timings";

const ayahCounts: Record<number, number> = {
  78: 40, 79: 46, 80: 42, 81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17,
  87: 19, 88: 26, 89: 30, 90: 20, 91: 15, 92: 21, 93: 11, 94: 8, 95: 8,
  96: 19, 97: 5, 98: 8, 99: 8, 100: 11, 101: 11, 102: 8, 103: 3, 104: 9,
  105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3, 111: 5, 112: 4, 113: 5,
  114: 6,
};

async function fixtureDirectory() {
  const directory = await mkdtemp(join(tmpdir(), "hafalku-timing-"));
  const audioDirectory = join(directory, "reference-audio");
  await mkdir(audioDirectory);
  const files = await Promise.all(JUZ_AMMA_SURAH_NUMBERS.map(async (surahNumber) => {
    const fileName = `${String(surahNumber).padStart(3, "0")}.mp3`;
    const bytes = Buffer.from(`reference-${surahNumber}`);
    await writeFile(join(audioDirectory, fileName), bytes);
    return {
      surahNumber,
      publicUrl: `https://audio.example.test/husary/${fileName}`,
      checksumSha256: createHash("sha256").update(bytes).digest("hex"),
    };
  }));

  const surahs: Record<string, unknown> = {};
  const segments: Record<string, unknown> = {};
  JUZ_AMMA_SURAH_NUMBERS.forEach((surahNumber) => {
    surahs[String(surahNumber)] = {
      surah_number: surahNumber,
      audio_url: `https://audio-cdn.tarteel.ai/quran/surah/husary/murattal/mp3/${String(surahNumber).padStart(3, "0")}.mp3`,
      duration: 1_000,
    };
    for (let ayahNumber = 1; ayahNumber <= ayahCounts[surahNumber]; ayahNumber += 1) {
      segments[`${surahNumber}:${ayahNumber}`] = { timestamp_from: ayahNumber * 10, timestamp_to: ayahNumber * 10 + 5 };
    }
  });
  const surahJsonPath = join(directory, "surah.json");
  const segmentsJsonPath = join(directory, "segments.json");
  const audioManifestPath = join(directory, "audio-manifest.json");
  await Promise.all([
    writeFile(surahJsonPath, JSON.stringify(surahs)),
    writeFile(segmentsJsonPath, JSON.stringify(segments)),
    writeFile(audioManifestPath, JSON.stringify({
      manifestVersion: 1,
      scope: "Juz Amma (78-114)",
      reciter: { name: "Mahmoud Khalil Al Hosary", riwayah: "Hafs 'an 'Asim", style: "Murattal", source: "Way2Quran", licenseNote: "Educational" },
      files,
    })),
  ]);
  return { audioDirectory, surahJsonPath, segmentsJsonPath, audioManifestPath };
}

describe("QUL timing activation", () => {
  it("emits a complete, verified verse timing manifest only for byte-identical audio", async () => {
    const fixture = await fixtureDirectory();
    const manifest = await createVerifiedJuzAmmaAudioTimingManifest({
      surahJsonPath: fixture.surahJsonPath,
      segmentsJsonPath: fixture.segmentsJsonPath,
      referenceAudioDirectory: fixture.audioDirectory,
      contaboAudioManifestPath: fixture.audioManifestPath,
      generatedAt: new Date("2026-09-17T00:00:00.000Z"),
    });
    expect(manifest.status).toBe("VERIFIED");
    expect(manifest.entries).toHaveLength(564);
    expect(manifest.entries.find((entry) => entry.verseKey === "112:1")).toMatchObject({ startMs: 10, endMs: 15 });
  });

  it("refuses to activate timestamps for a different MP3 recording", async () => {
    const fixture = await fixtureDirectory();
    const audioManifest = JSON.parse(await readFile(fixture.audioManifestPath, "utf8")) as { files: { checksumSha256: string }[] };
    audioManifest.files[0].checksumSha256 = "0".repeat(64);
    await writeFile(fixture.audioManifestPath, JSON.stringify({
      manifestVersion: 1,
      scope: "Juz Amma (78-114)",
      reciter: { name: "Mahmoud Khalil Al Hosary", riwayah: "Hafs 'an 'Asim", style: "Murattal", source: "Way2Quran", licenseNote: "Educational" },
      files: audioManifest.files.map((file, index) => ({ ...file, surahNumber: JUZ_AMMA_SURAH_NUMBERS[index], publicUrl: `https://audio.example.test/${index}.mp3` })),
    }));
    await expect(createVerifiedJuzAmmaAudioTimingManifest({
      surahJsonPath: fixture.surahJsonPath,
      segmentsJsonPath: fixture.segmentsJsonPath,
      referenceAudioDirectory: fixture.audioDirectory,
      contaboAudioManifestPath: fixture.audioManifestPath,
    })).rejects.toThrow("does not byte-match");
  });

  it("rejects a timestamp that exceeds QUL's one-second duration rounding window", async () => {
    const fixture = await fixtureDirectory();
    const segments = JSON.parse(await readFile(fixture.segmentsJsonPath, "utf8")) as Record<string, { timestamp_to: number }>;
    segments["78:40"].timestamp_to = 1_001_001;
    await writeFile(fixture.segmentsJsonPath, JSON.stringify(segments));
    await expect(createVerifiedJuzAmmaAudioTimingManifest({
      surahJsonPath: fixture.surahJsonPath,
      segmentsJsonPath: fixture.segmentsJsonPath,
      referenceAudioDirectory: fixture.audioDirectory,
      contaboAudioManifestPath: fixture.audioManifestPath,
    })).rejects.toThrow("outside the audio duration");
  });
});
