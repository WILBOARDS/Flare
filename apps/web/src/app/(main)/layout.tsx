'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { BottomNav } from '@/components/layout/bottom-nav';
import { ErrorBoundary } from '@/components/error-boundary';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, supabaseUser, loading } = useAuth();
  const router = useRouter();

  // Still loading if: initial load OR supabase session exists but platform user not yet exchanged
  const isResolving = loading || (!!supabaseUser && !user);

  useEffect(() => {
    if (isResolving) return;
    if (!user) router.replace('/login');
    else if (!user.username) router.replace('/onboarding');
  }, [user, isResolving, router]);

  if (isResolving || !user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-20">
      <main className="page-container pt-4">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <BottomNav />
    </div>
  );
}
