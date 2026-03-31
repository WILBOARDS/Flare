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
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white">Set up your profile</h1>
          <p className="text-neutral-400 mt-2 text-sm">Choose a username to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">@</span>
              <input
                className="input pl-8"
                type="text"
                placeholder="yourname"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">Display Name</label>
            <input
              className="input"
              type="text"
              placeholder="Your Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : "Let's go →"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
