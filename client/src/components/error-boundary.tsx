import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-2">Algo salió mal</h1>
            <p className="text-gray-400 mb-6 text-sm">
              Ocurrió un error inesperado. Intentá recargar la página.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 border border-white/20 text-sm hover:bg-white/10 transition-colors"
              >
                Reintentar
              </button>
              <a
                href="/"
                className="px-4 py-2 border border-white/20 text-sm hover:bg-white/10 transition-colors"
              >
                Volver al inicio
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
