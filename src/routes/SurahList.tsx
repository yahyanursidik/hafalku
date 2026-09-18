import { Link } from "react-router-dom";
import { surahs } from "../features/quran/fixtures";

export function SurahList() {
  const ayahCount = surahs.reduce((total, surah) => total + surah.verses.length, 0);

  return (
    <main className="page surah-page" aria-labelledby="surah-title">
      <h1 id="surah-title">Juz Amma</h1>
      <p className="surah-intro">{surahs.length} surah · {ayahCount} ayat</p>
      <ol className="surah-list">
        {surahs.map((surah) => (
          <li key={surah.number}>
            <Link to={`/surah/${surah.number}`}>
              <span className="surah-number">{surah.number}</span>
              <span className="surah-name"><strong>{surah.name}</strong><small>{surah.meaning} · {surah.verses.length} ayat</small></span>
              <span className="surah-arabic" lang="ar" dir="rtl">{surah.nameArabic}</span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
