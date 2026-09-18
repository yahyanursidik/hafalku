import { Refine } from "@refinedev/core";
import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <Refine options={{ syncWithLocation: false, warnWhenUnsavedChanges: false }}>
        {children}
      </Refine>
    </BrowserRouter>
  );
}
