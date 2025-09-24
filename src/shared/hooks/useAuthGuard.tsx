import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/model/store';
import type { ReactNode } from 'react';

export const PrivateOnly = ({ children }: { children: ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  return user ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

export const GuestOnly = ({ children }: { children: ReactNode }) => {
  const user = useAuthStore((state) => state.user);

  return user ? <Navigate to="/" replace /> : <>{children}</>;
};
