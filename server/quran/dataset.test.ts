// @vitest-environment node
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { diffQuranDatasets } from "./diff";
import { loadQuranDataset } from "./dataset";
import { writeValidationReport } from "./report";
import { validateQuranDataset } from "./validate";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

async function writeFixture(overrides: { textUthmani?: string; duplicateVerse?: boolean } = {}) {
  const directory = await mkdtemp(join(tmpdir(), "hafalku-quran-"));
  temporaryDirectories.push(directory);
  const verse = {
    verseKey: "1:1",
    surahNumber: 1,
    ayahNumber: 1,
    textUthmani: overrides.textUthmani ?? "ا",
  };
  const files: Record<string, unknown> = {
    "metadata.json": { version: "test-v1", sourceName: "local-test" },
    "surahs.json": [{ surahNumber: 1, nameAr: "ا", nameId: "Test", ayahCount: 1, revelationType: "MAKKI" }],
    "verses.json": overrides.duplicateVerse ? [verse, verse] : [verse],
    "words.json": [{ verseKey: "1:1", position: 1, textArabic: "ا" }],
    "translations-id.json": { language: "id", title: "Test", source: "local", edition: "v1", verses: [{ verseKey: "1:1", text: "Test" }] },
    "transliterations-id.json": { language: "id", source: "local", version: "v1", verses: [{ verseKey: "1:1", text: "A" }] },
  };

  await Promise.all(Object.entries(files).map(([fileName, value]) => writeFile(join(directory, fileName), JSON.stringify(value), "utf8")));
  const checksums = await Promise.all(
    Object.keys(files).sort().map(async (fileName) => {
      const content = await readFile(join(directory, fileName));
      return `${createHash("sha256").update(content).digest("hex")}  ${fileName}`;
    }),
  );
  await writeFile(join(directory, "SHA256SUMS"), `${checksums.join("\n")}\n`, "utf8");
  return directory;
}

describe("local Quran dataset validation", () => {
  it("reports duplicate and missing verses without mutating dataset text", async () => {
    const originalArabic = "ا\u0653";
    const dataset = await loadQuranDataset(await writeFixture({ textUthmani: originalArabic, duplicateVerse: true }));
    const report = validateQuranDataset(dataset, new Date("2026-01-01T00:00:00.000Z"));

    expect(dataset.verses[0].textUthmani).toBe(originalArabic);
    expect(report.issues.map((item) => item.code)).toEqual(
      expect.arrayContaining(["DUPLICATE_VERSE_KEY", "MISSING_SURAH", "NON_NORMALIZED_ARABIC"]),
    );
  });

  it("writes a machine-readable JSON report", async () => {
    const directory = await writeFixture();
    const dataset = await loadQuranDataset(directory);
    const reportPath = await writeValidationReport(join(directory, "report.json"), validateQuranDataset(dataset));

    await expect(readFile(reportPath, "utf8")).resolves.toContain('"datasetVersion": "test-v1"');
  });

  it("diffs dataset versions using original verse text", async () => {
    const from = await loadQuranDataset(await writeFixture());
    const to = await loadQuranDataset(await writeFixture({ textUthmani: "ب" }));
    const result = diffQuranDatasets(from, to);

    expect(result.changedVerseKeys).toEqual(["1:1"]);
    expect(result.addedVerseKeys).toEqual([]);
    expect(result.removedVerseKeys).toEqual([]);
  });
});
