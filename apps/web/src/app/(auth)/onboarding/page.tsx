'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { motion } from 'framer-motion';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';

export default function OnboardingPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.match(/^[a-zA-Z0-9_]{3,30}$/)) {
      toast.error('Username: 3-30 chars, letters/numbers/underscore only');
      return;
    }
    setLoading(true);
    try {
      await apiClient.patch('/users/me', { username, displayName: displayName || username });
      await refreshUser();
      router.replace('/feed');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to set username');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[400px] h-[400px] rounded-full bg-brand/15 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-orange-900/15 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <span
            className="text-3xl font-black tracking-tight"
            style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FFB347 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            FLAIR
          </span>
          <h1 className="text-2xl font-black text-white mt-3">Set up your profile</h1>
          <p className="text-neutral-500 mt-1.5 text-sm">Pick a username to get started on FLAIR</p>
        </div>

        <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">@</span>
                <input
                  className="input pl-8"
                  type="text"
                  placeholder="yourname"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  required
                  maxLength={30}
                  autoComplete="off"
                  autoFocus
                />
              </div>
              <p className="text-xs text-neutral-600 mt-1.5">3-30 characters, letters, numbers, underscores</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Display Name
              </label>
              <input
                className="input"
                type="text"
                placeholder="Your Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
              />
            </div>
            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                "Let's go →"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
