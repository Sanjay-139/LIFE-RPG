import React, { Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { GameProvider } from './context/GameContext';
import { AppRoutes } from './routes/AppRoutes';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled Application Error:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('life_rpg_token');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-error-container text-error flex items-center justify-center mb-4 shadow-md">
            <span className="material-symbols-outlined text-[32px]">warning</span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface mb-2">Something went wrong</h1>
          <p className="text-sm text-on-surface-variant max-w-md mb-6">
            {this.state.error?.message || 'An unexpected error occurred while loading LIFE RPG.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-primary-container text-on-primary font-bold text-sm hover:bg-primary shadow-sm"
            >
              Reload Page
            </button>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-semibold text-sm hover:bg-surface-container-high"
            >
              Reset Session
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            <GameProvider>
              <AppRoutes />
            </GameProvider>
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
