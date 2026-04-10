'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuthContext';

interface ProtectedLayoutWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper that protects routes from unauthenticated users
 * Redirects to /signin if user is not authenticated
 */
export function ProtectedLayoutWrapper({ children }: ProtectedLayoutWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  // List of pages that don't require authentication
  const publicPages = ['/signin', '/signup', '/forgot-password'];
  const isPublicPage = publicPages.includes(pathname);

  useEffect(() => {
    // If not loading and not authenticated, redirect to signin
    if (!isLoading && !isAuthenticated && !isPublicPage) {
      router.push('/signin');
    }
  }, [isLoading, isAuthenticated, isPublicPage, router]);

  // If unauthenticated and not on public page, don't render
  if (!isAuthenticated && !isPublicPage) {
    return null;
  }

  return <>{children}</>;
}
