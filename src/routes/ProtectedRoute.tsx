import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-bright flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center animate-pulse mb-4 shadow-md">
          <span className="material-symbols-outlined text-[28px] animate-spin">cyclone</span>
        </div>
        <p className="text-sm font-bold text-on-surface">Synchronizing Adventurer Session...</p>
        <span className="text-xs text-on-surface-variant mt-1">Connecting to LIFE RPG Node</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but haven't finished onboarding, force onboarding unless already on it
  if (user && !user.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
