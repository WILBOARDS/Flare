'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertTriangle, Wallet, ArrowRight } from 'lucide-react';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';
import { isValidAddress } from '@/lib/wallet-crypto';

type Step = 'profile' | 'wallet';

export default function OnboardingPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>('profile');

  // Profile step
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Wallet step
  const [walletAddress, setWalletAddress] = useState('');
  const [walletLoading, setWalletLoading] = useState(false);

  // ---- Profile submit ----
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.match(/^[a-zA-Z0-9_]{3,30}$/)) {
      toast.error('Username: 3-30 chars, letters/numbers/underscore only');
      return;
    }
    setProfileLoading(true);
    try {
      await apiClient.patch('/users/me', { username, displayName: displayName || username });
      await refreshUser();
      setStep('wallet');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to set username');
    } finally {
      setProfileLoading(false);
    }
  };

  // ---- Wallet: connect existing ----
  const handleConnectWallet = async () => {
    const addr = walletAddress.trim();
    if (!isValidAddress(addr)) {
      toast.error('Enter a valid Polygon/Ethereum address (0x…)');
      return;
    }
    setWalletLoading(true);
    try {
      await apiClient.post('/users/me/wallet', { walletAddress: addr });
      await refreshUser();
      router.replace('/wallet');
      toast.success('Wallet connected!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save wallet');
      setWalletLoading(false);
    }
  };

  // ---- Wallet: skip ----
  const handleSkipWallet = () => {
    router.replace('/feed');
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[400px] h-[400px] rounded-full bg-brand/15 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-orange-900/15 blur-[100px]" />
      </div>

      {/* Step indicators */}
      <div className="relative z-10 flex items-center gap-2 mb-8">
        {(['profile', 'wallet'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full transition-colors ${
                step === s ? 'bg-brand' : i < (['profile', 'wallet'] as Step[]).indexOf(step) ? 'bg-brand/40' : 'bg-neutral-700'
              }`}
            />
            {i < 1 && <div className="w-6 h-px bg-neutral-700" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Step 1: Profile ── */}
        {step === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-sm"
          >
            <div className="text-center mb-8">
              <span
                className="text-3xl font-black tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #FF6B35 0%, #FFB347 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                FLAIR
              </span>
              <h1 className="text-2xl font-black text-white mt-3">Set up your profile</h1>
              <p className="text-neutral-500 mt-1.5 text-sm">Pick a username to get started</p>
            </div>

            <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 shadow-2xl">
              <form onSubmit={handleProfileSubmit} className="space-y-4">
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

                <button type="submit" className="btn-primary w-full mt-2" disabled={profileLoading}>
                  {profileLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Next <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Wallet (optional) ── */}
        {step === 'wallet' && (
          <motion.div
            key="wallet"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-sm"
          >
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-brand/20 flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-7 h-7 text-brand" />
              </div>
              <h1 className="text-2xl font-black text-white">Connect a Wallet</h1>
              <p className="text-neutral-500 mt-1.5 text-sm">
                Optional — you can always do this later on the Wallet page.
              </p>
            </div>

            <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <p className="text-sm text-neutral-400">
                Enter your existing Polygon wallet address to start earning FLC rewards.
              </p>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  Wallet Address
                </label>
                <input
                  className="input font-mono text-sm"
                  type="text"
                  placeholder="0x…"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value.trim())}
                  spellCheck={false}
                  autoComplete="off"
                />
                {walletAddress && !isValidAddress(walletAddress) && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Not a valid Ethereum address
                  </p>
                )}
              </div>

              <button
                onClick={handleConnectWallet}
                disabled={walletLoading || !isValidAddress(walletAddress)}
                className="btn-primary w-full"
              >
                {walletLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Connect & Finish'
                )}
              </button>

              <button
                onClick={handleSkipWallet}
                className="w-full text-sm text-neutral-500 hover:text-white transition-colors py-2"
              >
                Skip for now — I'll set up a wallet later
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
