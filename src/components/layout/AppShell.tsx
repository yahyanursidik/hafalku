import { Link, NavLink, Outlet } from "react-router-dom";
import { appConfig } from "../../lib/env";

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link className="app-name" to="/" aria-label={`${appConfig.name} beranda`}>
          <span className="brand-mark" aria-hidden="true">
            <img src="/brand/hafalku-logo.png" alt="" />
          </span>
          <span className="app-wordmark">{appConfig.name}</span>
        </Link>
        <nav aria-label="Navigasi utama">
          <NavLink end to="/">
            Beranda
          </NavLink>
          <NavLink to="/surah">Surah</NavLink>
        </nav>
        <Link className="app-start-link" to="/surah/78">Mulai</Link>
      </header>
      <Outlet />
      <footer className="app-footer">
        <div className="app-footer-brand">
          <span>{appConfig.name}</span>
          <p>Teman kecil untuk membaca, mendengar, dan mengulang hafalan.</p>
        </div>
        <div className="app-footer-links">
          <Link to="/">Beranda</Link>
          <Link to="/surah">Juz Amma</Link>
        </div>
      </footer>
    </div>
  );
}
