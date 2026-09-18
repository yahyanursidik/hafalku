import { Link } from "react-router-dom";
import { surahs } from "../features/quran/fixtures";

export function ChildHome() {
  const firstSurah = surahs[0];
  const shortStarters = surahs.filter((surah) => [112, 113, 114].includes(surah.number));

  return (
    <main className="page child-home" aria-labelledby="home-title">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <p className="greeting">Assalamu’alaikum</p>
          <h1 id="home-title">Hari ini, satu ayat.</h1>
          <p className="home-intro">Pilih surah, dengarkan ayatnya, lalu ulangi dengan tenang.</p>
        </div>
        <span className="home-path-mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </section>

      <section className="home-now" aria-labelledby="home-now-title">
        <div className="home-section-heading">
          <h2 id="home-now-title">Mulai dari Juz Amma.</h2>
          <p>Surah pertama sudah siap untuk dipelajari.</p>
        </div>
        <article className="home-now-card">
          <div className="home-surah-name">
            <span lang="ar" dir="rtl">{firstSurah.nameArabic}</span>
            <strong>{firstSurah.name}</strong>
            <small>{firstSurah.verses.length} ayat</small>
          </div>
          <Link aria-label={`Mulai ${firstSurah.name}`} className="home-primary-action" to={`/surah/${firstSurah.number}`}>
            <span>Mulai {firstSurah.name}</span>
            <span aria-hidden="true">→</span>
          </Link>
        </article>
      </section>

      <section className="home-short-surahs" aria-labelledby="home-short-title">
        <div className="home-section-heading">
          <h2 id="home-short-title">Mau mulai singkat?</h2>
          <p>Tiga surah pendek untuk latihan pertama.</p>
        </div>
        <div className="home-starter-list">
          {shortStarters.map((surah) => (
            <Link aria-label={`Buka ${surah.name}, ${surah.verses.length} ayat`} className={`home-starter-card starter-${surah.number}`} key={surah.number} to={`/surah/${surah.number}`}>
              <span className="home-starter-arabic" lang="ar" dir="rtl">{surah.nameArabic}</span>
              <span className="home-starter-copy">
                <strong>{surah.name}</strong>
                <small>{surah.verses.length} ayat</small>
              </span>
              <span className="home-starter-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-learning-flow" aria-labelledby="home-flow-title">
        <div className="home-section-heading">
          <h2 id="home-flow-title">Ikuti langkahnya.</h2>
          <p>Satu alur kecil untuk membantu hafalan tetap mengalir.</p>
        </div>
        <ol className="home-steps">
          <li>
            <span aria-hidden="true">1.0</span>
            <div><h3>Pilih ayat</h3><p>Mulai dari ayat yang ingin kamu hafal.</p></div>
          </li>
          <li>
            <span aria-hidden="true">2.0</span>
            <div><h3>Dengarkan</h3><p>Putar audio ayat untuk mengikuti bacaannya.</p></div>
          </li>
          <li>
            <span aria-hidden="true">3.0</span>
            <div><h3>Ulangi pelan-pelan</h3><p>Atur pengulangan sampai bacaan terasa mantap.</p></div>
          </li>
        </ol>
      </section>

      <section className="home-explore" aria-labelledby="home-explore-title">
        <div>
          <h2 id="home-explore-title">Semua surah Juz Amma.</h2>
          <p>Telusuri 37 surah dan pilih bacaan yang ingin dipelajari hari ini.</p>
        </div>
        <Link className="home-secondary-action" to="/surah">Lihat daftar surah <span aria-hidden="true">→</span></Link>
      </section>
    </main>
  );
}
