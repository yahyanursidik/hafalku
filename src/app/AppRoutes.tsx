import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { ChildHome } from "../routes/ChildHome";
import { HijaiyahPage } from "../routes/HijaiyahPage";
import { MemorizationPlayer } from "../routes/MemorizationPlayer";
import { SurahList } from "../routes/SurahList";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<ChildHome />} />
        <Route path="hijaiyah" element={<HijaiyahPage />} />
        <Route path="surah" element={<SurahList />} />
        <Route path="surah/:surahNumber" element={<MemorizationPlayer />} />
      </Route>
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
