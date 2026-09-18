import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const sourceUrl = "https://equran.id/api/v2";
const outputPath = resolve("src/features/quran/fixtures/juz-amma.equran.json");
const expectedSurahNumbers = Array.from({ length: 37 }, (_, index) => index + 78);

type EquranAyah = {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: Record<string, string>;
};

type EquranSurah = {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  arti: string;
  audioFull: Record<string, string>;
  ayat: EquranAyah[];
};

async function fetchSurah(surahNumber: number): Promise<EquranSurah> {
  const response = await fetch(`${sourceUrl}/surat/${surahNumber}`);
  if (!response.ok) throw new Error(`EQuran request failed for surah ${surahNumber} (${response.status})`);
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || !("data" in payload)) throw new Error(`Unexpected EQuran response for surah ${surahNumber}`);
  return payload.data as EquranSurah;
}

async function main() {
  const surahs = [];
  for (const surahNumber of expectedSurahNumbers) {
    // Sequential requests keep the one-time importer well within fair use.
    const sourceSurah = await fetchSurah(surahNumber);
    if (sourceSurah.nomor !== surahNumber || sourceSurah.ayat.length !== sourceSurah.jumlahAyat) {
      throw new Error(`Incomplete EQuran data for surah ${surahNumber}.`);
    }
    if (!sourceSurah.audioFull["04"] || sourceSurah.ayat.some((ayah) => !ayah.audio["04"])) {
      throw new Error(`Ibrahim Al-Dossari audio is unavailable for surah ${surahNumber}.`);
    }

    const verses = sourceSurah.ayat.map((ayah, index) => {
      if (ayah.nomorAyat !== index + 1 || !ayah.teksArab || !ayah.teksLatin || !ayah.teksIndonesia) {
        throw new Error(`Invalid EQuran verse ${surahNumber}:${index + 1}.`);
      }
      return {
        ayahNumber: ayah.nomorAyat,
        arabic: ayah.teksArab,
        transliteration: ayah.teksLatin,
        translation: ayah.teksIndonesia,
      };
    });

    surahs.push({
      number: sourceSurah.nomor,
      name: sourceSurah.namaLatin,
      nameArabic: sourceSurah.nama,
      meaning: sourceSurah.arti,
      verses,
    });
  }

  const canonicalPayload = JSON.stringify({ surahs });
  const output = {
    fixtureVersion: `equran-v2-juz-amma-${new Date().toISOString().slice(0, 10)}`,
    source: {
      name: "EQuran.id API v2",
      url: "https://equran.id/apidev/v2",
      endpoint: "/api/v2/surat/{78..114}",
      attribution: "EQuran.id identifies the Quran data source as Kementerian Agama Republik Indonesia.",
      fetchedAt: new Date().toISOString(),
      usageNote: "Imported once as a local frontend fixture. The application never requests EQuran at runtime.",
    },
    audio: {
      reciter: "Ibrahim Al-Dossari",
      source: "EQuran.id API v2",
      sourceKey: "04",
      importStatus: "not-downloaded",
      usageNote: "Audio URLs are intentionally excluded. Downloading or mirroring requires written redistribution permission and a separate Contabo importer workflow.",
    },
    contentSha256: createHash("sha256").update(canonicalPayload).digest("hex"),
    surahs,
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Wrote ${surahs.length} EQuran surahs to ${outputPath}`);
}

await main();
