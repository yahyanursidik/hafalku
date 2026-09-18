import { AppErrorBoundary } from "../components/system/AppErrorBoundary";
import { AppRoutes } from "./AppRoutes";

export function App() {
  return (
    <AppErrorBoundary>
      <AppRoutes />
    </AppErrorBoundary>
  );
}
