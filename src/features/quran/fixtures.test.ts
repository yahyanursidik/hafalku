import juzAmmaFixture from "./fixtures/juz-amma.equran.json";
import { surahs } from "./fixtures";

describe("Juz Amma fixture", () => {
  it("contains the complete sequential Juz Amma range from its recorded source artifact", () => {
    expect(juzAmmaFixture.surahs).toHaveLength(37);
    expect(juzAmmaFixture.surahs.map((surah) => surah.number)).toEqual(
      Array.from({ length: 37 }, (_, index) => index + 78),
    );
    expect(juzAmmaFixture.surahs.flatMap((surah) => surah.verses)).toHaveLength(564);

    for (const surah of juzAmmaFixture.surahs) {
      expect(surah.verses.map((verse) => verse.ayahNumber)).toEqual(
        Array.from({ length: surah.verses.length }, (_, index) => index + 1),
      );
      expect(surah.verses.every((verse) => verse.arabic.length > 0 && verse.translation.length > 0)).toBe(true);
    }
  });

  it("matches its content hash and does not alter imported Arabic text for display", async () => {
    const bytes = new TextEncoder().encode(JSON.stringify({ surahs: juzAmmaFixture.surahs }));
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");

    expect(hash).toBe(juzAmmaFixture.contentSha256);
    expect(surahs.flatMap((surah) => surah.verses.map((verse) => verse.arabic))).toEqual(
      juzAmmaFixture.surahs.flatMap((surah) => surah.verses.map((verse) => verse.arabic)),
    );
  });

  it("keeps source-versioned Indonesian transliteration available for every verse", () => {
    expect(juzAmmaFixture.surahs.flatMap((surah) => surah.verses)).toHaveLength(564);
    expect(juzAmmaFixture.surahs.every((surah) => surah.verses.every((verse) => verse.transliteration.length > 0))).toBe(true);
    expect(surahs.flatMap((surah) => surah.verses.map((verse) => verse.transliteration))).toEqual(
      juzAmmaFixture.surahs.flatMap((surah) => surah.verses.map((verse) => verse.transliteration)),
    );
  });

  it("enables only verified, timestamp-bounded Husary audio for every Juz Amma verse", () => {
    const audioEntries = surahs.flatMap((surah) => surah.verses.map((verse) => verse.audio));
    expect(audioEntries).toHaveLength(564);
    expect(audioEntries.every((audio) => audio && audio.source.includes("qul-tarteel-v1") && audio.startMs >= 0 && audio.endMs > audio.startMs)).toBe(true);
  });
});
