import { render, screen } from "@testing-library/react";
import { App } from "./App";
import { AppProviders } from "../providers/AppProviders";

describe("App", () => {
  it("renders the child home route", () => {
    render(
      <AppProviders>
        <App />
      </AppProviders>,
    );

    expect(screen.getByRole("heading", { name: "Hari ini, satu ayat." })).toBeInTheDocument();
  });
});
