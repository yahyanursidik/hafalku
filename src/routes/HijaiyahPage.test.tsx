import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../app/AppRoutes";
import { hijaiyahLetters } from "../features/hijaiyah/letters";
import { HijaiyahPage } from "./HijaiyahPage";

function renderPage() {
  render(<MemoryRouter><HijaiyahPage /></MemoryRouter>);
}

describe("Hijaiyah learning", () => {
  it("offers 28 base letters and two supplementary cards, with complete learning content", () => {
    expect(hijaiyahLetters.filter((letter) => letter.kind === "letter")).toHaveLength(28);
    expect(new Set(hijaiyahLetters.map((letter) => letter.id)).size).toBe(30);
    for (const letter of hijaiyahLetters) {
      expect(letter.glyph).toMatch(/\p{Script=Arabic}/u);
      expect(letter.nameArabic).toMatch(/\p{Script=Arabic}/u);
      expect(letter.pronunciationLatin.trim()).not.toBe("");
      expect(letter.explanation.trim()).not.toBe("");
    }
    renderPage();
    expect(screen.getAllByRole("button", { name: /^Pelajari/ })).toHaveLength(30);
    expect(screen.getByRole("button", { name: "Sebelumnya" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Kartu 1 dari 30");
  });

  it("keeps Arabic visible and updates the name, pronunciation, selection and keyboard focus together", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "Pelajari Ba" }));
    const detail = screen.getByRole("region", { name: "Ba" });
    expect(within(detail).getByText("ب")).toHaveAttribute("lang", "ar");
    expect(within(detail).getByText("بَاء")).toHaveAttribute("dir", "rtl");
    expect(within(detail).getByText("Baa")).toBeVisible();
    expect(within(detail).getByText(/satu titik di bawah/)).toBeVisible();
    expect(screen.getByRole("heading", { name: "Ba" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Pelajari Ba" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Pelajari Alif" })).toHaveAttribute("aria-pressed", "false");
    await user.click(screen.getByRole("button", { name: "Berikutnya" }));
    expect(screen.getByRole("heading", { name: "Ta" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Sebelumnya" }));
    expect(screen.getByRole("heading", { name: "Ba" })).toBeVisible();
  });

  it("explains supplementary letters and respects the last-card boundary and restart", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "Pelajari Hamzah" }));
    expect(screen.getByText(/Hamzah berbeda dari Alif/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Berikutnya" }));
    expect(screen.getByText(/bukan huruf dasar tambahan/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Berikutnya" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Kartu 30 dari 30");
    await user.click(screen.getByRole("button", { name: "Kembali ke Alif" }));
    expect(screen.getByRole("heading", { name: "Alif" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Sebelumnya" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Berikutnya" })).toBeEnabled();
  });

  it("opens through the real route, marks navigation active and exposes source notes", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={["/hijaiyah"]}><AppRoutes /></MemoryRouter>);
    const nav = screen.getByRole("navigation", { name: "Navigasi utama" });
    expect(within(nav).getByRole("link", { name: "Hijaiyah" })).toHaveAttribute("aria-current", "page");
    await user.click(screen.getByText("Sumber materi dan catatan pelafalan"));
    expect(screen.getByRole("link", { name: /Madinah Arabic/ })).toHaveAttribute("href", "https://madinaharabic.com/free-content/reading/lesson-1/part-1");
    expect(screen.getByText(/Belum tersedia audio pelafalan/)).toBeVisible();
    expect(screen.getByText(/Warna tidak menunjukkan kelompok makhraj/)).toBeVisible();
    expect(screen.getByRole("link", { name: /Lihat surah Juz Amma/ })).toHaveAttribute("href", "/surah");
  });

  it("preserves each card color when selected and carries it into the reading panel", async () => {
    const user = userEvent.setup();
    renderPage();
    const cards = screen.getAllByRole("button", { name: /^Pelajari/ });
    expect(new Set(cards.map((card) => card.getAttribute("data-tone"))).size).toBe(4);
    for (const name of ["Ghain", "Kha", "‘Ain", "Ya", "Lam-alif"]) {
      const card = screen.getByRole("button", { name: `Pelajari ${name}` });
      const tone = card.getAttribute("data-tone");
      await user.click(card);
      expect(card).toHaveAttribute("data-tone", tone);
      expect(card).toHaveAttribute("aria-pressed", "true");
      const detail = screen.getByRole("region", { name });
      expect(detail).toHaveAttribute("data-tone", tone);
      expect(within(detail).getByRole("heading", { name })).toHaveFocus();
      expect(card.querySelector(".hijaiyah-tile-glyph")).toHaveAttribute("lang", "ar");
      expect(card.querySelector(".hijaiyah-tile-label")).toHaveTextContent(name);
    }
  });
});
