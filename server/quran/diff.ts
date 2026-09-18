import type { QuranDataset } from "./dataset";

export type DatasetDiff = {
  fromVersion: string;
  toVersion: string;
  fromContentHash: string;
  toContentHash: string;
  addedVerseKeys: string[];
  removedVerseKeys: string[];
  changedVerseKeys: string[];
};

export function diffQuranDatasets(from: QuranDataset, to: QuranDataset): DatasetDiff {
  const fromVerses = new Map(from.verses.map((verse) => [verse.verseKey, verse]));
  const toVerses = new Map(to.verses.map((verse) => [verse.verseKey, verse]));
  const addedVerseKeys = [...toVerses.keys()].filter((key) => !fromVerses.has(key)).sort();
  const removedVerseKeys = [...fromVerses.keys()].filter((key) => !toVerses.has(key)).sort();
  const changedVerseKeys = [...toVerses.entries()]
    .filter(([key, verse]) => {
      const fromVerse = fromVerses.get(key);
      return fromVerse !== undefined && (fromVerse.textUthmani !== verse.textUthmani || fromVerse.textImlaei !== verse.textImlaei);
    })
    .map(([key]) => key)
    .sort();

  return {
    fromVersion: from.metadata.version,
    toVersion: to.metadata.version,
    fromContentHash: from.contentHash,
    toContentHash: to.contentHash,
    addedVerseKeys,
    removedVerseKeys,
    changedVerseKeys,
  };
}
