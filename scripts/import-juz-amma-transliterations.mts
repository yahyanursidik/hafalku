import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const packageVersion = "3.1.2";
const sourceRoot = `https://cdn.jsdelivr.net/npm/quran-json@${packageVersion}/dist/chapters`;
const canonicalFixturePath = resolve("src/features/quran/fixtures/juz-amma.digital-islami.json");
const outputPath = resolve("src/features/quran/fixtures/juz-amma.transliteration.quran-json.json");
const expectedSurahNumbers = Array.from({ length: 37 }, (_, index) => index + 78);

type SourceChapter = {
  id: number;
  verses: Array<{ id: number; transliteration: string }>;
};

type CanonicalFixture = {
  surahs: Array<{ number: number; verses: Array<{ ayahNumber: number }> }>;
};

async function loadSourceChapter(surahNumber: number): Promise<SourceChapter> {
  const response = await fetch(`${sourceRoot}/${surahNumber}.json`);
  if (!response.ok) throw new Error(`quran-json request failed for surah ${surahNumber} (${response.status})`);
  return response.json() as Promise<SourceChapter>;
}

async function main() {
  const canonicalFixture = JSON.parse(await readFile(canonicalFixturePath, "utf8")) as CanonicalFixture;
  if (canonicalFixture.surahs.map((surah) => surah.number).join(",") !== expectedSurahNumbers.join(",")) {
    throw new Error("The existing local fixture must contain exactly Juz Amma before transliterations are imported.");
  }

  const surahs = await Promise.all(expectedSurahNumbers.map(async (surahNumber) => {
    const source = await loadSourceChapter(surahNumber);
    const canonicalSurah = canonicalFixture.surahs.find((surah) => surah.number === surahNumber);
    if (!canonicalSurah || source.id !== surahNumber || source.verses.length !== canonicalSurah.verses.length) {
      throw new Error(`Invalid transliteration mapping for surah ${surahNumber}.`);
    }

    return {
      number: surahNumber,
      verses: source.verses.map((verse, index) => {
        if (verse.id !== canonicalSurah.verses[index].ayahNumber || !verse.transliteration) {
          throw new Error(`Invalid transliteration mapping for ${surahNumber}:${index + 1}.`);
        }
        return { ayahNumber: verse.id, transliteration: verse.transliteration };
      }),
    };
  }));

  const canonicalPayload = JSON.stringify({ surahs });
  const output = {
    fixtureVersion: `quran-json-${packageVersion}-juz-amma`,
    source: {
      name: "quran-json",
      url: "https://github.com/abdulsamadola/quran-json",
      package: `quran-json@${packageVersion}`,
      attribution: "English transliteration sourced by quran-json from Tanzil.net. quran-json is CC BY-SA 4.0.",
      usageNote: "Imported once as a local learning-aid fixture. It is not canonical Arabic text and the application never requests this source at runtime.",
    },
    contentSha256: createHash("sha256").update(canonicalPayload).digest("hex"),
    surahs,
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Wrote transliteration for ${surahs.length} surahs to ${outputPath}`);
}

await main();
