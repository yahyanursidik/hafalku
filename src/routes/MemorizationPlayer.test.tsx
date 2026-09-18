import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, expect, vi } from "vitest";
import { getSurah } from "../features/quran/fixtures";
import { MemorizationPlayer } from "./MemorizationPlayer";

const ikhlasFirstVerse = getSurah(112)?.verses[0];

function renderPlayer(path = "/surah/112") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes><Route path="/surah/:surahNumber" element={<MemorizationPlayer />} /></Routes>
    </MemoryRouter>,
  );
}

describe("MemorizationPlayer", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  it("keeps Arabic visible when Latin becomes the focus", async () => {
    const user = userEvent.setup();
    renderPlayer();
    await user.click(screen.getByRole("button", { name: "Fokus Latin" }));
    expect(screen.getByLabelText("Ayat 1")).toBeVisible();
    expect(screen.getByText(ikhlasFirstVerse!.transliteration!)).toHaveClass("is-primary");
    expect(screen.getByText(ikhlasFirstVerse!.arabic.split(/\s+/).slice(0, 2).join(" "))).toHaveClass("chunk-0");
  });

  it("shows the translation only when requested", async () => {
    const user = userEvent.setup();
    renderPlayer();
    expect(screen.queryByText(ikhlasFirstVerse!.translation)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Tampilkan arti" }));
    expect(screen.getByText(ikhlasFirstVerse!.translation)).toBeVisible();
  });

  it("offers a larger Latin aid and optional visual word grouping", async () => {
    const user = userEvent.setup();
    renderPlayer();
    await user.click(screen.getByRole("button", { name: "Ukuran Latin besar" }));
    expect(screen.getByText(ikhlasFirstVerse!.transliteration!)).toHaveClass("is-large");
    await user.click(screen.getByRole("button", { name: "Chunk warna" }));
    expect(screen.getByText(ikhlasFirstVerse!.arabic.split(/\s+/).slice(0, 2).join(" "))).toHaveClass("chunk-0");
  });

  it("keeps Arabic visible while every Juz Amma verse offers Latin and flow-color aids", () => {
    renderPlayer("/surah/78");
    const ayah = screen.getByLabelText("Ayat 1");
    expect(ayah.querySelector('[lang="ar"]')?.textContent).not.toEqual("");
    expect(screen.getByRole("button", { name: "Fokus Latin" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Chunk warna" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Putar audio" })).toBeVisible();
  });
});
