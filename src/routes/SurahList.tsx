import { Link } from "react-router-dom";
import { surahs } from "../features/quran/fixtures";

export function SurahList() {
  const ayahCount = surahs.reduce((total, surah) => total + surah.verses.length, 0);

  return (
    <main className="page surah-page" aria-labelledby="surah-title">
      <p className="surah-kicker">Juz 30 · {surahs.length} surah</p>
      <h1 id="surah-title">Pilih surah untuk hari ini.</h1>
      <p className="surah-intro">Ada {ayahCount} ayat yang bisa dipelajari pelan-pelan. Ketuk satu surah untuk mulai.</p>
      <ol className="surah-list">
        {surahs.map((surah, index) => (
          <li key={surah.number}>
            <Link aria-label={`Buka ${surah.name}, ${surah.verses.length} ayat`} className={`surah-list-card surah-tone-${index % 3}`} to={`/surah/${surah.number}`}>
              <span className="surah-number"><small>Surah</small>{surah.number}</span>
              <span className="surah-name"><strong>{surah.name}</strong><small>{surah.meaning} · {surah.verses.length} ayat</small></span>
              <span className="surah-arabic" lang="ar" dir="rtl">{surah.nameArabic}</span>
              <span className="surah-open" aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
