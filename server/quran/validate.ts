import { createHash } from "node:crypto";
import type { QuranDataset } from "./dataset";

export type ValidationIssue = {
  code: string;
  message: string;
  context?: Record<string, string | number>;
};

export type QuranValidationReport = {
  datasetVersion: string;
  contentHash: string;
  generatedAt: string;
  valid: boolean;
  issueCount: number;
  issues: ValidationIssue[];
};

function issue(
  issues: ValidationIssue[],
  code: string,
  message: string,
  context?: ValidationIssue["context"],
): void {
  issues.push({ code, message, context });
}

function expectedVerseKeys(dataset: QuranDataset): Set<string> {
  const keys = new Set<string>();
  dataset.surahs.forEach((surah) => {
    for (let ayahNumber = 1; ayahNumber <= surah.ayahCount; ayahNumber += 1) {
      keys.add(`${surah.surahNumber}:${ayahNumber}`);
    }
  });
  return keys;
}

function validateCoverage(
  issues: ValidationIssue[],
  label: "translation" | "transliteration",
  expected: Set<string>,
  values: { verseKey: string }[],
): void {
  const keys = new Set(values.map((value) => value.verseKey));
  expected.forEach((verseKey) => {
    if (!keys.has(verseKey)) {
      issue(issues, `MISSING_${label.toUpperCase()}`, `Missing ${label} for verse`, { verseKey });
    }
  });
  keys.forEach((verseKey) => {
    if (!expected.has(verseKey)) {
      issue(issues, `UNKNOWN_${label.toUpperCase()}`, `${label} references an unknown verse`, { verseKey });
    }
  });
}

export function validateQuranDataset(dataset: QuranDataset, generatedAt = new Date()): QuranValidationReport {
  const issues: ValidationIssue[] = [];
  const requiredFiles = [...dataset.fileBytes.keys()].filter((fileName) => fileName !== "SHA256SUMS");

  requiredFiles.forEach((fileName) => {
    const expectedHash = dataset.checksums.get(fileName);
    const actualHash = createHash("sha256").update(dataset.fileBytes.get(fileName)!).digest("hex");
    if (!expectedHash) {
      issue(issues, "MISSING_CHECKSUM", "Checksum is not listed for dataset file", { fileName });
    } else if (actualHash !== expectedHash) {
      issue(issues, "CHECKSUM_MISMATCH", "Checksum does not match dataset file", { fileName });
    }
  });

  const surahNumbers = new Set<number>();
  dataset.surahs.forEach((surah) => {
    if (surahNumbers.has(surah.surahNumber)) {
      issue(issues, "DUPLICATE_SURAH", "Surah number appears more than once", { surahNumber: surah.surahNumber });
    }
    surahNumbers.add(surah.surahNumber);
    if (surah.nameAr !== surah.nameAr.normalize("NFC")) {
      issue(issues, "NON_NORMALIZED_ARABIC", "Arabic text is not NFC-normalized; importer will not alter it", { surahNumber: surah.surahNumber });
    }
  });
  if (dataset.surahs.length !== 114) {
    issue(issues, "SURAH_COUNT", "Dataset must contain exactly 114 surahs", { actual: dataset.surahs.length });
  }
  for (let surahNumber = 1; surahNumber <= 114; surahNumber += 1) {
    if (!surahNumbers.has(surahNumber)) {
      issue(issues, "MISSING_SURAH", "Expected surah is missing", { surahNumber });
    }
  }

  const verseKeys = new Set<string>();
  const verseCounts = new Map<number, Set<number>>();
  dataset.verses.forEach((verse) => {
    const expectedKey = `${verse.surahNumber}:${verse.ayahNumber}`;
    if (verse.verseKey !== expectedKey) {
      issue(issues, "VERSE_KEY_MISMATCH", "Verse key does not match surah and ayah numbers", { verseKey: verse.verseKey });
    }
    if (verseKeys.has(verse.verseKey)) {
      issue(issues, "DUPLICATE_VERSE_KEY", "Verse key appears more than once", { verseKey: verse.verseKey });
    }
    verseKeys.add(verse.verseKey);
    const ayahs = verseCounts.get(verse.surahNumber) ?? new Set<number>();
    if (ayahs.has(verse.ayahNumber)) {
      issue(issues, "DUPLICATE_AYAH", "Ayah number appears more than once in a surah", { surahNumber: verse.surahNumber, ayahNumber: verse.ayahNumber });
    }
    ayahs.add(verse.ayahNumber);
    verseCounts.set(verse.surahNumber, ayahs);
    if (verse.textUthmani !== verse.textUthmani.normalize("NFC")) {
      issue(issues, "NON_NORMALIZED_ARABIC", "Arabic text is not NFC-normalized; importer will not alter it", { verseKey: verse.verseKey });
    }
  });

  const expectedKeys = expectedVerseKeys(dataset);
  expectedKeys.forEach((verseKey) => {
    if (!verseKeys.has(verseKey)) {
      issue(issues, "MISSING_VERSE", "Expected verse is missing", { verseKey });
    }
  });
  verseKeys.forEach((verseKey) => {
    if (!expectedKeys.has(verseKey)) {
      issue(issues, "UNKNOWN_VERSE", "Verse is not declared by its surah ayah count", { verseKey });
    }
  });

  const wordPositions = new Set<string>();
  dataset.words.forEach((word) => {
    const positionKey = `${word.verseKey}:${word.position}`;
    if (wordPositions.has(positionKey)) {
      issue(issues, "DUPLICATE_WORD_POSITION", "Word position appears more than once", { verseKey: word.verseKey, position: word.position });
    }
    wordPositions.add(positionKey);
    if (!verseKeys.has(word.verseKey)) {
      issue(issues, "UNKNOWN_WORD_VERSE", "Word references an unknown verse", { verseKey: word.verseKey });
    }
    if (word.textArabic !== word.textArabic.normalize("NFC")) {
      issue(issues, "NON_NORMALIZED_ARABIC", "Arabic text is not NFC-normalized; importer will not alter it", { verseKey: word.verseKey, position: word.position });
    }
  });

  validateCoverage(issues, "translation", expectedKeys, dataset.translations.verses);
  validateCoverage(issues, "transliteration", expectedKeys, dataset.transliterations.verses);
  dataset.audio.forEach((audio) => {
    if (!verseKeys.has(audio.verseKey)) {
      issue(issues, "UNKNOWN_AUDIO_VERSE", "Audio references an unknown verse", { verseKey: audio.verseKey });
    }
  });

  return {
    datasetVersion: dataset.metadata.version,
    contentHash: dataset.contentHash,
    generatedAt: generatedAt.toISOString(),
    valid: issues.length === 0,
    issueCount: issues.length,
    issues,
  };
}
