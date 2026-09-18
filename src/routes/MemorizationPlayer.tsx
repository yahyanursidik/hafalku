import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { VerseDisplay } from "../components/quran/VerseDisplay";
import { QuranAudioPlayer } from "../components/quran/QuranAudioPlayer";
import { getSurah } from "../features/quran/fixtures";
import { getPhraseChunkEnds } from "../features/quran/learningChunks";
import { isVerseAudioVerificationPending } from "../features/quran/audioTimings";

export function MemorizationPlayer() {
  const { surahNumber } = useParams();
  const surah = getSurah(Number(surahNumber));
  const [verseIndex, setVerseIndex] = useState(0);
  const [focusLanguage, setFocusLanguage] = useState<"arabic" | "latin">("arabic");
  const [showTranslation, setShowTranslation] = useState(false);
  const [largeTransliteration, setLargeTransliteration] = useState(false);
  const [showColorGroups, setShowColorGroups] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  if (!surah) return <Navigate replace to="/surah" />;

  const verse = surah.verses[verseIndex];
  const isFirstVerse = verseIndex === 0;
  const isLastVerse = verseIndex === surah.verses.length - 1;
  const phraseChunkEnds = getPhraseChunkEnds(surah.number, verse.ayahNumber, (verse.arabic.match(/\S+/g) ?? []).length);
  const hasTransliteration = Boolean(verse.transliteration);
  const hasColorChunks = phraseChunkEnds.length > 0;
  const displayedFocusLanguage = hasTransliteration ? focusLanguage : "arabic";
  const displayedColorGroups = hasColorChunks && showColorGroups;

  return (
    <main className={`player-page ${focusMode ? "is-focused" : ""}`} aria-labelledby="player-title">
      <div className="player-topline">
        <Link to="/surah">← Semua surah</Link>
        <span>Ayat {verseIndex + 1} dari {surah.verses.length}</span>
      </div>
      <header className="player-heading">
        <h1 id="player-title">{surah.name}</h1>
        <p lang="ar" dir="rtl">{surah.nameArabic}</p>
      </header>
      <VerseDisplay verse={verse} showTransliteration showTranslation={showTranslation} largeTransliteration={largeTransliteration} showColorGroups={displayedColorGroups} focusLanguage={displayedFocusLanguage} phraseChunkEnds={phraseChunkEnds} />
      {verse.audio ? <QuranAudioPlayer key={`${surah.number}:${verse.ayahNumber}`} {...verse.audio} /> : (
        <p className="audio-status" role="status">
          {isVerseAudioVerificationPending
            ? "Audio ayat sedang disiapkan. Kamu tetap bisa membaca dan mengulang ayat ini."
            : "Audio untuk ayat ini belum tersedia."}
        </p>
      )}
      <div className="player-options" aria-label="Bantuan belajar">
        <button type="button" className="learning-control" aria-label="Fokus Arabic" aria-pressed={focusLanguage === "arabic"} onClick={() => setFocusLanguage("arabic")}>
          <span className="learning-icon learning-icon-arabic" aria-hidden="true">ع</span>
          <span className="learning-control-label">Arab</span>
          <span className="learning-control-state">{focusLanguage === "arabic" ? "Aktif" : "Pilih"}</span>
        </button>
        <button type="button" className="learning-control" aria-label="Fokus Latin" aria-pressed={displayedFocusLanguage === "latin"} disabled={!hasTransliteration} onClick={() => { setFocusLanguage("latin"); setShowColorGroups(true); }}>
          <span className="learning-icon" aria-hidden="true">A</span>
          <span className="learning-control-label">Latin</span>
          <span className="learning-control-state">{hasTransliteration ? displayedFocusLanguage === "latin" ? "Aktif" : "Pilih" : "Belum ada"}</span>
        </button>
        <button type="button" className="learning-control" aria-label="Ukuran Latin besar" aria-pressed={largeTransliteration} disabled={!hasTransliteration} onClick={() => setLargeTransliteration((value) => !value)}>
          <span className="learning-icon" aria-hidden="true">A+</span>
          <span className="learning-control-label">Lebih besar</span>
          <span className="learning-control-state">{hasTransliteration ? largeTransliteration ? "Aktif" : "Pilih" : "Belum ada"}</span>
        </button>
        <button type="button" className="learning-control" aria-label="Tampilkan arti" aria-pressed={showTranslation} onClick={() => setShowTranslation((value) => !value)}>
          <span className="learning-icon" aria-hidden="true">T</span>
          <span className="learning-control-label">Arti</span>
          <span className="learning-control-state">{showTranslation ? "Aktif" : "Pilih"}</span>
        </button>
        <button type="button" className="learning-control" aria-label="Chunk warna" aria-pressed={displayedColorGroups} disabled={!hasColorChunks} onClick={() => setShowColorGroups((value) => !value)}>
          <span className="learning-icon learning-icon-color" aria-hidden="true"><i /><i /><i /></span>
          <span className="learning-control-label">Warna</span>
          <span className="learning-control-state">{hasColorChunks ? displayedColorGroups ? "Aktif" : "Pilih" : "Belum ada"}</span>
        </button>
        <button type="button" className="learning-control" aria-label="Mode fokus" aria-pressed={focusMode} onClick={() => setFocusMode((value) => !value)}>
          <span className="learning-icon learning-icon-focus" aria-hidden="true"><i /><i /><i /><i /></span>
          <span className="learning-control-label">Fokus</span>
          <span className="learning-control-state">{focusMode ? "Aktif" : "Pilih"}</span>
        </button>
      </div>
      {displayedColorGroups ? <p className="learning-flow-note">Warna membantu kelompok latihan; bacaan tetap mengalir sampai akhir ayat.</p> : null}
      <nav className="verse-navigation" aria-label="Pindah ayat">
        <button type="button" disabled={isFirstVerse} onClick={() => setVerseIndex((index) => index - 1)}>Sebelumnya</button>
        <button type="button" className="button-primary" disabled={isLastVerse} onClick={() => setVerseIndex((index) => index + 1)}>Ayat berikutnya</button>
      </nav>
    </main>
  );
}
