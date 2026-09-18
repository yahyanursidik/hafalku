import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SurahList } from "./SurahList";

describe("SurahList", () => {
  it("gives every surah a clear child-friendly entry point", () => {
    render(
      <MemoryRouter>
        <SurahList />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Pilih surah untuk hari ini." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Buka An-Naba', 40 ayat" })).toHaveAttribute("href", "/surah/78");
    expect(screen.getByRole("link", { name: "Buka An-Nas, 6 ayat" })).toHaveAttribute("href", "/surah/114");
  });
});
