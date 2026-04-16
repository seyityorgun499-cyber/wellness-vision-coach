import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/types/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Debug logging
  console.log('[ProtectedRoute] loading:', loading, 'user?.onboardingCompleted:', user?.onboardingCompleted, 'pathname:', location.pathname);

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to={ROUTES.AUTH} replace />;
  }

  // If onboarding status is unknown, wait (will be brief after splash)
  if (user.onboardingCompleted === undefined) {
    return null;
  }

  // Only redirect to onboarding if explicitly not completed
  if (user.onboardingCompleted === false && location.pathname !== ROUTES.ONBOARDING) {
    return <Navigate to={ROUTES.ONBOARDING} replace />;
  }

  return <>{children}</>;
};
