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
          <span>{appConfig.name}</span>
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
        <p>Belajar satu ayat, lalu ulangi sampai terasa mantap.</p>
        <div>
          <span>{appConfig.name}</span>
          <Link to="/surah">Juz Amma</Link>
        </div>
      </footer>
    </div>
  );
}
