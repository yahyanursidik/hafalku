import { Component, type ErrorInfo, type ReactNode } from "react";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  error: Error | null;
};

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  public state: AppErrorBoundaryState = { error: null };

  public static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("Unhandled application error", error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ error: null });
  };

  public render() {
    if (this.state.error) {
      return (
        <main className="system-message" aria-labelledby="application-error-title">
          <h1 id="application-error-title">Halaman tidak dapat dimuat</h1>
          <p>Silakan coba lagi.</p>
          <button type="button" onClick={this.handleReset}>
            Coba lagi
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
