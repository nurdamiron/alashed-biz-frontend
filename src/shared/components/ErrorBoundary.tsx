import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.hash = '/';
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-6">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-red-500/10 flex items-center justify-center">
              <span className="material-symbols-rounded text-red-500 text-4xl">error</span>
            </div>

            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              Что-то пошло не так
            </h1>

            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу.
            </p>

            {this.state.error && (
              <div className="mb-6 p-4 rounded-2xl bg-gray-100 dark:bg-white/5 text-left overflow-auto max-h-32">
                <p className="text-xs font-mono text-red-500 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleGoHome}
                className="flex-1 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 font-bold text-sm active:scale-95 transition-all"
              >
                На главную
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 h-12 rounded-2xl bg-primary text-white font-bold text-sm active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                Перезагрузить
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
