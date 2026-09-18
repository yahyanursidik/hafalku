import type { Verse } from "../../features/quran/types";

type VerseDisplayProps = {
  verse: Verse;
  showTransliteration: boolean;
  showTranslation: boolean;
  largeTransliteration: boolean;
  showColorGroups: boolean;
  focusLanguage: "arabic" | "latin";
  phraseChunkEnds: number[];
};

export function VerseDisplay({
  verse,
  showTransliteration,
  showTranslation,
  largeTransliteration,
  showColorGroups,
  focusLanguage,
  phraseChunkEnds,
}: VerseDisplayProps) {
  const hasTransliteration = Boolean(verse.transliteration);
  const words = verse.arabic.match(/\S+/g) ?? [];
  const chunkEnds = [...new Set([...phraseChunkEnds, words.length])]
    .filter((end) => end > 0 && end <= words.length)
    .sort((left, right) => left - right);
  const chunks = chunkEnds.reduce<string[]>((result, end, index) => {
    const start = index === 0 ? 0 : chunkEnds[index - 1];
    result.push(words.slice(start, end).join(" "));
    return result;
  }, []);

  return (
    <section className="verse-display" aria-label={`Ayat ${verse.ayahNumber}`}>
      {showTransliteration && hasTransliteration && focusLanguage === "latin" ? <p className={`verse-latin is-primary ${largeTransliteration ? "is-large" : ""}`}>{verse.transliteration}</p> : null}
      <p className={`verse-arabic ${focusLanguage === "latin" ? "is-secondary" : ""}`} dir="rtl" lang="ar">
        {chunks.map((chunk, index) => (
          <span className={showColorGroups ? `verse-chunk chunk-${index % 3}` : "verse-chunk"} key={`${chunk}-${index}`}>
            {chunk}{index < chunks.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
      {showTransliteration && hasTransliteration && focusLanguage === "arabic" ? <p className={`verse-latin ${largeTransliteration ? "is-large" : ""}`}>{verse.transliteration}</p> : null}
      {showTranslation ? <p className="verse-translation">{verse.translation}</p> : null}
    </section>
  );
}
