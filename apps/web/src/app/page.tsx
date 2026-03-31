'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) {
      if (!user.username) {
        router.replace('/onboarding');
      } else {
        router.replace('/feed');
      }
    } else {
      router.replace('/login');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
