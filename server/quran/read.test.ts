// @vitest-environment node
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { describe, expect, it, vi } from "vitest";
import { respondToQuranGet } from "./http";
import type { QuranReadRepository } from "./repository";
import { getVerse, getVerseAudio, getVerseWords, listSurahs } from "./read";

function repository(active = true): QuranReadRepository {
  return {
    getActiveDataset: vi.fn().mockResolvedValue(active ? { id: "active-dataset", version: "v1.0.0" } : undefined),
    listSurahs: vi.fn().mockResolvedValue({
      rows: [{ surahNumber: 1, nameAr: "ا", nameId: "Test", ayahCount: 1, revelationType: "MAKKI" }], total: 1,
    }),
    findSurah: vi.fn().mockResolvedValue(undefined),
    findVerse: vi.fn().mockResolvedValue({ verseKey: "1:1", ayahNumber: 1, textUthmani: "ا", textImlaei: null }),
    findTranslations: vi.fn().mockResolvedValue([{ language: "id", title: "Test", source: "local", edition: "v1", text: "Test" }]),
    findTransliterations: vi.fn().mockResolvedValue([{ language: "id", text: "A", source: "local", version: "v1", status: "APPROVED" }]),
    findWords: vi.fn().mockResolvedValue([{ position: 1, textArabic: "ا" }]),
    findAudio: vi.fn().mockResolvedValue([{ assetUrl: "https://example.test/1.mp3", durationMs: 1000, startMs: 0, endMs: 1000, checksum: "hash", reciter: { name: "Test", source: "local", licenseNote: "test" } }]),
  };
}

describe("Quran read API services", () => {
  it("paginates surahs from the active dataset only", async () => {
    const store = repository();
    const result = await listSurahs(store, { page: "2", limit: "10" });

    expect(store.listSurahs).toHaveBeenCalledWith("active-dataset", 10, 10);
    expect(result.meta).toEqual({ datasetVersion: "v1.0.0", page: 2, limit: 10, total: 1 });
  });

  it("does not return Quran Core data when no dataset is active", async () => {
    await expect(getVerse(repository(false), "1:1")).rejects.toMatchObject({
      code: "QURAN_DATASET_UNAVAILABLE", status: 503,
    });
  });

  it("returns verse learning aids, words, and audio from the active dataset", async () => {
    const store = repository();
    const [verse, words, audio] = await Promise.all([
      getVerse(store, "1:1"), getVerseWords(store, "1:1"), getVerseAudio(store, "1:1"),
    ]);

    expect(verse.data).toMatchObject({ verseKey: "1:1", textUthmani: "ا", translations: [{ language: "id" }] });
    expect(words.data).toEqual([{ position: 1, textArabic: "ا" }]);
    expect(audio.data).toMatchObject([{ reciter: { name: "Test" } }]);
    expect(store.findWords).toHaveBeenCalledWith("active-dataset", "1:1");
    expect(store.findAudio).toHaveBeenCalledWith("active-dataset", "1:1");
  });

  it("rejects non-GET requests before a Quran resolver can run", async () => {
    const status = vi.fn().mockReturnThis();
    const response = { setHeader: vi.fn(), status, json: vi.fn() } as unknown as VercelResponse;
    const resolver = vi.fn();
    const request = { method: "POST", query: {} } as unknown as VercelRequest;

    await respondToQuranGet(request, response, "/api/v1/quran/surahs", resolver);

    expect(resolver).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(405);
    expect(response.setHeader).toHaveBeenCalledWith("Allow", "GET");
  });
});
