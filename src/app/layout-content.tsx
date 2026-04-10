'use client';

import { TopNavBar, BottomNavBar } from "@/components/Navigation";
import { ProtectedLayoutWrapper } from "./protected-layout";
import { useAuth } from "@/hooks/useAuthContext";
import { OfflineBanner } from "@/components/OfflineBanner";
import { OfflineSyncManager } from "@/components/OfflineSyncManager";
import { PWARegistrar } from "@/components/PWARegistrar";
import { ReactNode } from "react";
import { Loader } from "lucide-react";
import { usePathname } from "next/navigation";

interface LayoutContentProps {
  children: ReactNode;
}

export function LayoutContent({ children }: LayoutContentProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();

  // Pages that don't require authentication
  const publicPages = ['/signin', '/signup', '/forgot-password'];
  const isPublicPage = publicPages.includes(pathname);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-primary" />
          <p className="text-on-surface-variant">Loading...</p>
        </div>
      </div>
    );
  }

  // For public pages, don't show navigation
  if (isPublicPage) {
    return children;
  }

  // For protected pages, show navigation and wrap with ProtectedLayoutWrapper
  return (
    <ProtectedLayoutWrapper>
      <PWARegistrar />
      <OfflineSyncManager />
      <TopNavBar />
      <BottomNavBar />
      
      <main className="flex-1 mx-4 mt-24 mb-24 md:mb-4 flex flex-col gap-6">
        <OfflineBanner />
        {children}
      </main>

      <footer className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center mt-auto bg-surface-container-low border-t border-outline-variant/20 gap-6">
        <div className="flex flex-col gap-2">
          <span className="font-serif italic text-primary text-xl">Editorial Clinical Excellence</span>
          <p className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant/60">© 2024 Editorial Clinical Excellence. All rights reserved.</p>
        </div>
        <div className="flex gap-8">
          <a className="font-sans text-xs uppercase tracking-widest text-on-surface-variant/60 hover:text-primary transition-colors" href="#">Legal</a>
          <a className="font-sans text-xs uppercase tracking-widest text-on-surface-variant/60 hover:text-primary transition-colors" href="#">Support</a>
          <a className="font-sans text-xs uppercase tracking-widest text-on-surface-variant/60 hover:text-primary transition-colors" href="#">Privacy Policy</a>
        </div>
      </footer>
    </ProtectedLayoutWrapper>
  );
}
