import { appConfig } from "../lib/env";

export function FoundationHome() {
  return (
    <main className="foundation-page" aria-labelledby="foundation-title">
      <p className="foundation-kicker">Fondasi aplikasi</p>
      <h1 id="foundation-title">{appConfig.name}</h1>
      <p>Ruang belajar hafalan sedang disiapkan.</p>
    </main>
  );
}
