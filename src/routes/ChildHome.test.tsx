import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChildHome } from "./ChildHome";

describe("ChildHome", () => {
  it("gives children a clear starting point and short-surah choices", () => {
    render(
      <MemoryRouter>
        <ChildHome />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Hari ini, satu ayat." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mulai An-Naba'" })).toHaveAttribute("href", "/surah/78");
    expect(screen.getByRole("link", { name: "Buka Al-Ikhlas, 4 ayat" })).toHaveAttribute("href", "/surah/112");
    expect(screen.getByRole("link", { name: "Buka Al-Falaq, 5 ayat" })).toHaveAttribute("href", "/surah/113");
    expect(screen.getByRole("link", { name: "Buka An-Nas, 6 ayat" })).toHaveAttribute("href", "/surah/114");
  });
});
