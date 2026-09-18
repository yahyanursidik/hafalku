export type VerseAudio = {
  source: string;
  startMs: number;
  endMs: number;
};

export type Verse = {
  ayahNumber: number;
  arabic: string;
  transliteration?: string;
  translation: string;
  audio?: VerseAudio;
};

export type Surah = {
  number: number;
  name: string;
  nameArabic: string;
  meaning: string;
  verses: Verse[];
};
