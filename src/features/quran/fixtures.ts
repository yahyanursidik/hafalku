import juzAmmaFixture from "./fixtures/juz-amma.equran.json";
import { getVerifiedVerseAudio } from "./audioTimings";
import type { Surah } from "./types";

export const surahs: Surah[] = juzAmmaFixture.surahs.map((sourceSurah) => ({
  number: sourceSurah.number,
  name: sourceSurah.name,
  nameArabic: sourceSurah.nameArabic,
  meaning: sourceSurah.meaning,
  verses: sourceSurah.verses.map((sourceVerse) => {
    return {
      ayahNumber: sourceVerse.ayahNumber,
      arabic: sourceVerse.arabic,
      translation: sourceVerse.translation,
      transliteration: sourceVerse.transliteration,
      audio: getVerifiedVerseAudio(sourceSurah.number, sourceVerse.ayahNumber),
    };
  }),
}));

export function getSurah(number: number) {
  return surahs.find((surah) => surah.number === number);
}
