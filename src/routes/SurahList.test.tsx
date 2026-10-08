import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { SurahList } from "./SurahList";

describe("SurahList", () => {
  it("gives every surah a clear child-friendly entry point", () => {
    render(
      <MemoryRouter>
        <SurahList />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Yuk, pilih surah." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Buka An-Naba', 40 ayat" })).toHaveAttribute("href", "/surah/78");
    expect(screen.getByRole("link", { name: "Buka An-Nas, 6 ayat" })).toHaveAttribute("href", "/surah/114");
  });

  it("finds surahs by name or number and recovers from an empty search", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><SurahList /></MemoryRouter>);
    const search = screen.getByRole("searchbox", { name: "Cari surah" });

    await user.type(search, "annas");
    expect(screen.getByRole("link", { name: "Buka An-Nas, 6 ayat" })).toBeVisible();
    expect(screen.queryByRole("link", { name: "Buka An-Naba', 40 ayat" })).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "78");
    expect(screen.getByRole("link", { name: "Buka An-Naba', 40 ayat" })).toBeVisible();

    await user.clear(search);
    await user.type(search, "zzzz");
    expect(screen.getByRole("heading", { name: "Surah belum ditemukan." })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Lihat semua surah" }));
    expect(screen.getAllByRole("link")).toHaveLength(37);
    expect(search).toHaveFocus();
  });
});
