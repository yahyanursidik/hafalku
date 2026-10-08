import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { surahs } from "../features/quran/fixtures";

function searchKey(value: string) {
  return value.toLocaleLowerCase("id").replace(/[^\p{L}\p{N}]/gu, "");
}

export function SurahList() {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const ayahCount = surahs.reduce((total, surah) => total + surah.verses.length, 0);
  const term = searchKey(query);
  const visibleSurahs = surahs.filter((surah) => [surah.name, surah.nameArabic, surah.meaning, String(surah.number)]
    .some((value) => searchKey(value).includes(term)));

  const clearSearch = () => {
    setQuery("");
    searchRef.current?.focus();
  };

  return (
    <main className="page surah-page surah-directory" aria-labelledby="surah-title">
      <header className="surah-directory-heading">
        <p className="surah-kicker">Juz 30 · {surahs.length} surah · {ayahCount} ayat</p>
        <h1 id="surah-title">Yuk, pilih surah.</h1>
        <p className="surah-intro">Ketuk surah yang ingin kamu baca. Belajar satu ayat, lalu ulangi pelan-pelan.</p>
      </header>
      <div className="surah-search">
        <label htmlFor="surah-search-input">Cari surah</label>
        <div className="surah-search-field">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></svg>
          <input id="surah-search-input" ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nama atau nomor, misalnya An-Nas" autoComplete="off" aria-controls="surah-results" />
          {query ? <button type="button" onClick={clearSearch} aria-label="Hapus pencarian"><span aria-hidden="true">×</span></button> : null}
        </div>
      </div>
      <p className="surah-result-count" role="status">{term ? `${visibleSurahs.length} surah ditemukan` : `Semua ${surahs.length} surah`}<span>Urut sesuai mushaf</span></p>
      <ol id="surah-results" className="surah-list">
        {visibleSurahs.map((surah) => (
          <li key={surah.number}>
            <Link aria-label={`Buka ${surah.name}, ${surah.verses.length} ayat`} className="surah-list-card" to={`/surah/${surah.number}`}>
              <span className="surah-number" aria-hidden="true">{surah.number}</span>
              <span className="surah-name"><strong>{surah.name}</strong><small>{surah.meaning}</small></span>
              <span className="surah-arabic" lang="ar" dir="rtl">{surah.nameArabic}</span>
              <span className="surah-verse-count">{surah.verses.length} ayat</span>
              <svg className="surah-open" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
            </Link>
          </li>
        ))}
      </ol>
      {visibleSurahs.length === 0 ? <div className="surah-empty"><h2>Surah belum ditemukan.</h2><p>Coba nama lain atau nomor surah dari 78 sampai 114.</p><button type="button" onClick={clearSearch}>Lihat semua surah</button></div> : null}
    </main>
  );
}
