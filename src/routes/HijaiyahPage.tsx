import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { hijaiyahLetters, hijaiyahSources } from "../features/hijaiyah/letters";

// Visual aids only: these colors do not classify makhraj or tajweed rules.
const letterTones = ["rose", "sky", "sand", "mint"] as const;

export function HijaiyahPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const detailPanel = useRef<HTMLElement>(null);
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const focusDetail = useRef(false);
  const letter = hijaiyahLetters[selectedIndex];

  useEffect(() => {
    if (focusDetail.current) {
      detailPanel.current?.scrollIntoView?.({ block: "start", behavior: "auto" });
      detailHeading.current?.focus({ preventScroll: true });
      focusDetail.current = false;
    }
  }, [selectedIndex]);

  function selectLetter(index: number) {
    if (index === selectedIndex) {
      detailPanel.current?.scrollIntoView?.({ block: "start", behavior: "auto" });
      detailHeading.current?.focus({ preventScroll: true });
      return;
    }
    focusDetail.current = true;
    setSelectedIndex(index);
  }

  return (
    <main className="page hijaiyah-page" aria-labelledby="hijaiyah-title">
      <header className="hijaiyah-heading">
        <h1 id="hijaiyah-title">Yuk, kenali hijaiyah.</h1>
        <p>Pilih huruf, lihat bentuknya, lalu ucapkan namanya bersama guru atau orang tua.</p>
      </header>

      <div className="hijaiyah-workbook">
        <section className="hijaiyah-detail" data-tone={letterTones[selectedIndex % letterTones.length]} aria-labelledby="letter-title" id="hijaiyah-detail" ref={detailPanel}>
          <p className="hijaiyah-position" role="status">Kartu {selectedIndex + 1} dari {hijaiyahLetters.length}</p>
          <span className="hijaiyah-hero-letter" lang="ar" dir="rtl">{letter.glyph}</span>
          <h2 id="letter-title" ref={detailHeading} tabIndex={-1}>{letter.name}</h2>
          <dl className="hijaiyah-pronunciation">
            <div><dt>Nama dalam Arab</dt><dd lang="ar" dir="rtl">{letter.nameArabic}</dd></div>
            <div><dt>Pelafalan nama (Latin)</dt><dd>{letter.pronunciationLatin}</dd></div>
          </dl>
          <p className="hijaiyah-explanation">{letter.explanation}</p>
          <p className="hijaiyah-name-hint">Ini nama huruf. Saat membaca kata, bunyinya mengikuti harakat.</p>
          <div className="hijaiyah-step-controls">
            <button type="button" disabled={selectedIndex === 0} onClick={() => setSelectedIndex(selectedIndex - 1)}>
              <span aria-hidden="true">←</span> Sebelumnya
            </button>
            <button type="button" className="hijaiyah-next" disabled={selectedIndex === hijaiyahLetters.length - 1} onClick={() => setSelectedIndex(selectedIndex + 1)}>
              Berikutnya <span aria-hidden="true">→</span>
            </button>
          </div>
          {selectedIndex === hijaiyahLetters.length - 1 && <button className="hijaiyah-restart" type="button" onClick={() => selectLetter(0)}>Kembali ke Alif</button>}
          <a className="hijaiyah-picker-link" href="#hijaiyah-choices">Pilih huruf lain <span aria-hidden="true">↓</span></a>
        </section>

        <section className="hijaiyah-choices" id="hijaiyah-choices" aria-labelledby="hijaiyah-choices-title">
          <h2 id="hijaiyah-choices-title">Pilih hurufnya</h2>
          <p>28 huruf dasar. Mulai dari kanan, lalu ke kiri.</p>
          <div className="hijaiyah-letter-grid" dir="rtl">
            {hijaiyahLetters.filter((item) => item.kind === "letter").map((item, index) => (
              <button className="hijaiyah-letter-button" data-tone={letterTones[index % letterTones.length]} key={item.id} type="button" aria-label={`Pelajari ${item.name}`} aria-pressed={selectedIndex === index} aria-controls="hijaiyah-detail" onClick={() => selectLetter(index)}>
                <span className="hijaiyah-tile-glyph" lang="ar">{item.glyph}</span><span className="hijaiyah-tile-label" dir="ltr">{item.name}</span>
                {selectedIndex === index && <span className="hijaiyah-selected-mark" aria-hidden="true">✓</span>}
              </button>
            ))}
          </div>
          <h3>Kenali juga</h3>
          <p>Hamzah dan gabungan Lam-alif.</p>
          <div className="hijaiyah-letter-grid hijaiyah-extra-grid" dir="rtl">
            {hijaiyahLetters.map((item, index) => item.kind === "extra" && (
              <button className="hijaiyah-letter-button" data-tone={letterTones[index % letterTones.length]} key={item.id} type="button" aria-label={`Pelajari ${item.name}`} aria-pressed={selectedIndex === index} aria-controls="hijaiyah-detail" onClick={() => selectLetter(index)}>
                <span className="hijaiyah-tile-glyph" lang="ar">{item.glyph}</span><span className="hijaiyah-tile-label" dir="ltr">{item.name}</span>
                {selectedIndex === index && <span className="hijaiyah-selected-mark" aria-hidden="true">✓</span>}
              </button>
            ))}
          </div>
        </section>
      </div>

      <aside className="hijaiyah-guide" aria-label="Panduan pendamping">
        <h2>Latihan kecil, bersama-sama.</h2>
        <p>Kenali beberapa huruf dulu. Lihat titiknya, ucapkan namanya, lalu coba pilih lagi. Latin hanya membantu; bunyi Arab tetap perlu dicontohkan oleh guru.</p>
        <details>
          <summary>Sumber materi dan catatan pelafalan</summary>
          <p>Ejaan Latin disederhanakan untuk pembaca Indonesia. Huruf ganda seperti aa dan ii membantu menandai vokal panjang dalam nama huruf, bukan aturan panjang bacaan ayat.</p>
          <p>Warna kartu hanya membantu melihat dan memilih huruf. Warna tidak menunjukkan kelompok makhraj atau aturan tajwid.</p>
          <ul>{hijaiyahSources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} <span aria-hidden="true">↗</span></a></li>)}</ul>
          <p>Materi ini pengenalan nama dan bentuk huruf, bukan panduan lengkap makhraj atau tajwid. Belum tersedia audio pelafalan di halaman ini.</p>
        </details>
        <Link className="hijaiyah-surah-link" to="/surah">Lihat surah Juz Amma <span aria-hidden="true">→</span></Link>
      </aside>
    </main>
  );
}
