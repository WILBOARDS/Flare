'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Coins, Zap, Users, TrendingUp, Shield, ArrowRight, Twitter, Github, MessageCircle } from 'lucide-react';
import { usePlatformStats } from '@/hooks/use-platform-stats';
import { formatCount } from '@/lib/utils';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { data: stats } = usePlatformStats();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
      {/* ── Sticky Nav ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span
            className="text-xl font-black tracking-tight"
            style={{ background: 'linear-gradient(135deg, #FF6B35, #FFB347)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            FLAIR
          </span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-neutral-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/login"
              className="text-sm bg-brand hover:bg-brand-600 text-white font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <div ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-14 overflow-hidden">
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-brand/10 blur-[160px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-orange-900/15 blur-[120px]" />
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-brand/8 blur-[100px]" />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 rounded-full px-4 py-1.5 text-sm text-brand font-medium mb-8"
          >
            <Zap className="w-3.5 h-3.5" /> Now on Polygon — gas-free creator economy
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="text-5xl sm:text-7xl font-black leading-[1.05] tracking-tight mb-6"
          >
            Create.{' '}
            <span style={{ background: 'linear-gradient(135deg, #FF6B35, #FFB347)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Earn.
            </span>{' '}
            Own.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            FLAIR is the social platform where creators mint their own tokens, monetize content directly, and own their audience — no middlemen, no platform cuts.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 bg-brand hover:bg-brand-600 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all hover:scale-105 active:scale-95"
            >
              Start Creating <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/feed"
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-colors"
            >
              Explore Feed
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-5 h-8 border-2 border-neutral-700 rounded-full flex items-start justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              className="w-1 h-1.5 bg-neutral-500 rounded-full"
            />
          </div>
        </motion.div>
      </div>

      {/* ── Stats ── */}
      <Section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Creators', value: stats?.totalUsers ?? 0 },
            { label: 'Posts', value: stats?.totalPosts ?? 0 },
            { label: 'Tokens', value: stats?.totalCreatorTokens ?? 0 },
          ].map(({ label, value }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 text-center"
            >
              <p className="text-3xl font-black text-brand">{formatCount(value)}</p>
              <p className="text-sm text-neutral-500 mt-1">{label}</p>
            </motion.div>
          ))}
        </div>
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mt-6 text-xs text-neutral-600">
          <span>Powered by <span className="text-purple-400 font-semibold">Polygon</span></span>
          <span>·</span>
          <span>Secured by <span className="text-green-400 font-semibold">Supabase</span></span>
          <span>·</span>
          <span>Built with <span className="text-blue-400 font-semibold">NestJS</span></span>
        </motion.div>
      </Section>

      {/* ── Features ── */}
      <Section className="max-w-6xl mx-auto px-6 py-24">
        <motion.div variants={fadeUp} className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-black mb-4">Built for the creator economy</h2>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto">Everything you need to build an audience and turn it into income — on-chain.</p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              icon: <Coins className="w-6 h-6 text-brand" />,
              title: 'Creator Tokens',
              desc: 'Mint your own ERC-20 token. Your community buys in, you earn when they do.',
            },
            {
              icon: <TrendingUp className="w-6 h-6 text-brand" />,
              title: 'FLC Rewards',
              desc: 'Earn FLAIR Coin for every like, share, and follower. Liquid, tradeable, yours.',
            },
            {
              icon: <Users className="w-6 h-6 text-brand" />,
              title: 'True Ownership',
              desc: 'Your followers live on-chain. No algorithm can take your audience away.',
            },
            {
              icon: <Shield className="w-6 h-6 text-brand" />,
              title: 'Decentralized',
              desc: 'Powered by Polygon. Sub-cent gas fees, instant finality, no gatekeepers.',
            },
            {
              icon: <Zap className="w-6 h-6 text-brand" />,
              title: 'TikTok-Speed UX',
              desc: 'Infinite scroll feed, instant likes, image posts — social UX you already know.',
            },
            {
              icon: <ArrowRight className="w-6 h-6 text-brand" />,
              title: 'Coming Soon',
              desc: 'Live streaming, NFT drops, co-creation, token-gated content and more.',
            },
          ].map((feat) => (
            <motion.div
              key={feat.title}
              variants={fadeUp}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-brand/30 transition-colors group"
            >
              <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center mb-4 group-hover:bg-brand/20 transition-colors">
                {feat.icon}
              </div>
              <h3 className="font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── How it works ── */}
      <Section className="max-w-6xl mx-auto px-6 py-24 border-t border-neutral-900">
        <motion.div variants={fadeUp} className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-black mb-4">How it works</h2>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto">Three steps from zero to earning.</p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Sign up', desc: 'Create your account with email or Google. Your profile lives on Polygon.' },
            { step: '02', title: 'Post & grow', desc: 'Share content, build followers, earn FLC rewards automatically.' },
            { step: '03', title: 'Launch your token', desc: 'Mint your Creator Token. Your community buys in, you both win.' },
          ].map((item) => (
            <motion.div key={item.step} variants={fadeUp} className="flex gap-5">
              <div className="flex-shrink-0">
                <span
                  className="text-4xl font-black leading-none"
                  style={{ background: 'linear-gradient(135deg, #FF6B35, #FFB347)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  {item.step}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── CTA Banner ── */}
      <Section className="max-w-6xl mx-auto px-6 py-24">
        <motion.div
          variants={fadeUp}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand/20 to-orange-900/20 border border-brand/20 p-12 text-center"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand/15 blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-orange-900/20 blur-[80px]" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black mb-4">Ready to own your audience?</h2>
            <p className="text-neutral-300 text-lg mb-8 max-w-lg mx-auto">Join thousands of creators building the next generation of social media.</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-600 text-white font-bold px-10 py-4 rounded-2xl text-base transition-all hover:scale-105 active:scale-95"
            >
              Join FLAIR <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </Section>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-900 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center sm:items-start gap-1">
              <span
                className="text-2xl font-black tracking-tight"
                style={{ background: 'linear-gradient(135deg, #FF6B35, #FFB347)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                FLAIR
              </span>
              <p className="text-xs text-neutral-600">Web3 SocialFi for creators · Built on Polygon</p>
            </div>

            <div className="flex items-center gap-6 text-sm text-neutral-500">
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link href="/feed" className="hover:text-white transition-colors">Feed</Link>
              <span className="text-neutral-800">·</span>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
            </div>

            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-xl bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4 text-neutral-400" />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors">
                <MessageCircle className="w-4 h-4 text-neutral-400" />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors">
                <Github className="w-4 h-4 text-neutral-400" />
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-900 text-center text-xs text-neutral-700">
            © {new Date().getFullYear()} FLAIR. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
