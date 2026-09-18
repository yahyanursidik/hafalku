import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const sourceUrl = "https://quran.api.digitalislami.id";
const outputPath = resolve("src/features/quran/fixtures/juz-amma.digital-islami.json");
const expectedSurahNumbers = Array.from({ length: 37 }, (_, index) => index + 78);

type SourceSurah = {
  name_arabic: string;
  name_latin: string;
  name_transliteration: string;
  number: number;
  number_of_ayahs: number;
};

type SourceAyah = {
  juz_number: number;
  number_in_surah: number;
  surah_id: number;
  text_uthmani: string;
  translation: string;
};

async function fetchData<T>(path: string): Promise<T> {
  const response = await fetch(`${sourceUrl}${path}`);
  if (!response.ok) throw new Error(`Digital Islami request failed: ${path} (${response.status})`);
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || !("data" in payload)) throw new Error(`Unexpected response for ${path}`);
  return payload.data as T;
}

function isExactlyJuzAmma(surahs: SourceSurah[]) {
  return surahs.length === expectedSurahNumbers.length
    && surahs.every((surah, index) => surah.number === expectedSurahNumbers[index]);
}

async function main() {
  const sourceSurahs = await fetchData<SourceSurah[]>("/juz/30/surah");
  if (!isExactlyJuzAmma(sourceSurahs)) throw new Error("Source does not contain exactly surahs 78–114 for Juz Amma.");

  const firstPage = await fetchData<{ ayahs: SourceAyah[]; juz: { total_ayahs: number } }>("/juz/30/ayah?lang=id&page=1&limit=100");
  const pages = Math.ceil(firstPage.juz.total_ayahs / 100);
  const ayahs = [...firstPage.ayahs];
  for (let page = 2; page <= pages; page += 1) {
    const data = await fetchData<{ ayahs: SourceAyah[] }>(`/juz/30/ayah?lang=id&page=${page}&limit=100`);
    ayahs.push(...data.ayahs);
  }

  const surahs = sourceSurahs.map((sourceSurah) => {
    const verses = ayahs
      .filter((ayah) => ayah.surah_id === sourceSurah.number)
      .sort((left, right) => left.number_in_surah - right.number_in_surah)
      .map((ayah) => ({
        ayahNumber: ayah.number_in_surah,
        arabic: ayah.text_uthmani,
        translation: ayah.translation,
      }));

    if (verses.length !== sourceSurah.number_of_ayahs) {
      throw new Error(`Surah ${sourceSurah.number} has ${verses.length} verses; expected ${sourceSurah.number_of_ayahs}.`);
    }
    if (verses.some((verse, index) => verse.ayahNumber !== index + 1 || !verse.arabic || !verse.translation)) {
      throw new Error(`Surah ${sourceSurah.number} has incomplete or non-sequential source data.`);
    }

    return {
      number: sourceSurah.number,
      meaning: sourceSurah.name_latin,
      nameArabic: sourceSurah.name_arabic,
      name: sourceSurah.name_transliteration,
      verses,
    };
  });

  const canonicalPayload = JSON.stringify({ surahs });
  const output = {
    fixtureVersion: `digital-islami-juz-amma-${new Date().toISOString().slice(0, 10)}`,
    source: {
      name: "Digital Islami Quran API Go",
      url: sourceUrl,
      endpoint: "/juz/30/surah and /juz/30/ayah?lang=id",
      fetchedAt: new Date().toISOString(),
      usageNote: "Imported once as a local frontend fixture. The application never requests this API at runtime.",
    },
    contentSha256: createHash("sha256").update(canonicalPayload).digest("hex"),
    surahs,
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Wrote ${surahs.length} surahs and ${ayahs.length} ayahs to ${outputPath}`);
}

await main();
