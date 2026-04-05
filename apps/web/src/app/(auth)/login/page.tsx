'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
        router.replace('/feed');
      } else {
        await signUpWithEmail(email, password);
        toast.success('Check your email to confirm your account!');
      }
    } catch (err: any) {
      toast.error(err.message ?? 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-brand/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-orange-900/20 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-6xl font-black tracking-tight"
            style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C5A 50%, #FFB347 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            FLAIR
          </motion.h1>
          <p className="text-neutral-500 mt-2 text-sm tracking-wide">Web3 SocialFi for creators</p>
        </div>

        {/* Card */}
        <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 shadow-2xl">
          {/* Mode tabs */}
          <div className="flex bg-neutral-800 rounded-xl p-1 mb-6">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === m ? 'bg-brand text-white shadow' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            <input
              className="input"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <div className="relative">
              <input
                className="input pr-12"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-neutral-600 text-sm mt-5">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-brand hover:text-brand-600 font-semibold transition-colors"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
