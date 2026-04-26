import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { loading, isAuthenticated, isSupabaseEnabled } = useAuth();

  if (!isSupabaseEnabled) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#FFFBF5]">
        <div className="w-16 h-16 rounded-full bg-[#F97316] flex items-center justify-center text-2xl animate-bounce">🐾</div>
        <p className="text-[#78716C] text-sm">Checking your doggo session…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
