// @vitest-environment node
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { JUZ_AMMA_SURAH_NUMBERS, createMp3QuranJuzAmmaAudio, type FetchFn } from "./mp3quran";

function response(json: unknown, bytes = new Uint8Array([1, 2, 3])) {
  return {
    ok: true,
    status: 200,
    json: async () => json,
    arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    headers: { get: () => String(bytes.byteLength) },
  };
}

describe("MP3Quran Juz Amma adapter", () => {
  it("creates timed per-verse metadata from shared surah assets", async () => {
    const fetchFn: FetchFn = async (url) => {
      if (url.endsWith("/reads")) {
        return response([{ id: 5, name: "Test Reciter", rewaya: "Hafs", folder_url: "https://audio.example/reciter/" }]);
      }
      if (url.includes("ayat_timing?")) return response([{ ayah: 1, start_time: 10, end_time: 1000 }]);
      return response(null);
    };
    const verseKeys = JUZ_AMMA_SURAH_NUMBERS.map((surahNumber) => `${surahNumber}:1`);
    const entries = await createMp3QuranJuzAmmaAudio(5, verseKeys, fetchFn);

    expect(entries).toHaveLength(37);
    expect(entries[0]).toMatchObject({ verseKey: "78:1", assetUrl: "https://audio.example/reciter/078.mp3", durationMs: 1000, startMs: 10, endMs: 1000 });
    expect(entries[0].checksum).toBe(createHash("sha256").update(Buffer.from([1, 2, 3])).digest("hex"));
  });

  it("refuses a partial Juz Amma input before producing metadata", async () => {
    const fetchFn: FetchFn = async () => response([{ id: 5, name: "Test Reciter", rewaya: "Hafs", folder_url: "https://audio.example/reciter/" }]);

    await expect(createMp3QuranJuzAmmaAudio(5, ["78:1"], fetchFn)).rejects.toThrow("include every Juz Amma surah");
  });
});
