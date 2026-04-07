'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/providers/auth-provider';

const STEPS = [
  { icon: '📨', label: 'Verification email sent', done: true },
  { icon: '🔗', label: 'Click the link in your inbox', done: false },
  { icon: '🚀', label: "You're in — start creating!", done: false },
];

// Floating particle component
function Particle({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <motion.div
      className="absolute bottom-0 rounded-full bg-brand/30 pointer-events-none"
      style={{ left: `${x}%`, width: size, height: size }}
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: -300, opacity: [0, 0.6, 0] }}
      transition={{ duration: 3.5 + Math.random() * 2, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resendVerificationEmail } = useAuth();

  const email = decodeURIComponent(searchParams.get('email') ?? '');
  const [countdown, setCountdown] = useState(0);
  const [resending, setResending] = useState(false);

  // Mask email for display
  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.+)$/, (_, a, b, c) => `${a}${'•'.repeat(Math.min(b.length, 5))}${c}`)
    : '';

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await resendVerificationEmail(email);
      toast.success('Verification email resent!');
      setCountdown(60);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  const particles = [
    { delay: 0, x: 15, size: 6 },
    { delay: 0.6, x: 30, size: 4 },
    { delay: 1.2, x: 50, size: 8 },
    { delay: 0.3, x: 65, size: 5 },
    { delay: 0.9, x: 80, size: 4 },
    { delay: 1.6, x: 92, size: 6 },
  ];

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Ambient orb */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-brand/15 blur-[150px]"
        />
        {/* Particles */}
        {particles.map((p, i) => (
          <Particle key={i} {...p} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm text-center"
      >
        {/* Brand */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="text-brand font-black text-lg tracking-widest mb-8"
        >
          FLAIR
        </motion.p>

        {/* Animated envelope */}
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
            className="relative"
          >
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-brand/20 to-orange-900/10 border border-brand/20 flex items-center justify-center shadow-lg shadow-brand/10">
              <Mail className="w-14 h-14 text-brand" strokeWidth={1.5} />
            </div>
            {/* Sparkle icon */}
            <motion.div
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-brand flex items-center justify-center shadow"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </motion.div>
            {/* Pulse rings */}
            {[0, 0.5, 1.0].map((delay, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-3xl border border-brand/20"
                animate={{ scale: [1, 1.6 + i * 0.2], opacity: [0.3, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay, ease: 'easeOut' }}
              />
            ))}
          </motion.div>
        </div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-white mb-2"
        >
          Check your inbox
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <p className="text-neutral-400 text-sm">We sent a verification link to</p>
          {maskedEmail && (
            <p className="text-brand font-semibold text-sm mt-1">{maskedEmail}</p>
          )}
        </motion.div>

        {/* Steps card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl p-5 mb-5 text-left"
        >
          <p className="text-neutral-500 text-xs font-medium uppercase tracking-widest mb-4">What's next</p>
          <div className="space-y-3.5">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="text-xl w-7 text-center leading-none">{step.icon}</span>
                <span className={`text-sm flex-1 ${step.done ? 'text-white' : 'text-neutral-500'}`}>
                  {step.label}
                </span>
                {step.done && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.7 + i * 0.1 }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Resend */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          onClick={handleResend}
          disabled={resending || countdown > 0}
          className="w-full btn-primary flex items-center justify-center gap-2 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : countdown > 0 ? (
            `Resend available in ${countdown}s`
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Resend verification email
            </>
          )}
        </motion.button>

        {/* Back */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          onClick={() => router.push('/login')}
          className="text-neutral-500 hover:text-neutral-300 text-sm transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sign in
        </motion.button>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
