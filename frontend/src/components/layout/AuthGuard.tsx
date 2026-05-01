'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, UserRole } from '@/lib/store';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export default function AuthGuard({ children, allowedRoles, redirectTo = '/login' }: AuthGuardProps) {
  const { user, isLoading, initFromStorage } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace(redirectTo);
        return;
      }
      // Admin can access everything
      if (user.role !== 'admin' && !allowedRoles.includes(user.role)) {
        router.replace('/login');
      }
    }
  }, [user, isLoading, allowedRoles, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) return null;
  if (user.role !== 'admin' && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
