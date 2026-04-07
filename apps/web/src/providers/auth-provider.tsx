'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import apiClient from '@/lib/api-client';
import { FLARE_TOKEN_KEY } from '@/lib/constants';
import type { User } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  supabaseId: string;
  email: string | null;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  followerCount: number;
  followingCount: number;
  walletAddress: string | null;
  creatorTokenAddress: string | null;
  createdAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  supabaseUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const exchangeSupabaseToken = useCallback(async (accessToken: string) => {
    try {
      const res = await apiClient.post('/auth/callback', { access_token: accessToken });
      const { user: platformUser, token } = res.data;
      localStorage.setItem(FLARE_TOKEN_KEY, token);
      setUser(platformUser);
      return platformUser;
    } catch (err) {
      console.error('[exchangeSupabaseToken] Failed to exchange token with platform API:', err);
      return null;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await apiClient.get('/auth/me');
      setUser(res.data);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.access_token) {
        await exchangeSupabaseToken(session.access_token);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSupabaseUser(session?.user ?? null);
      if (event === 'SIGNED_IN' && session?.access_token) {
        await exchangeSupabaseToken(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem(FLARE_TOKEN_KEY);
      }
    });

    return () => subscription.unsubscribe();
  }, [exchangeSupabaseToken, supabase.auth]);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      const isProviderError =
        error.status === 400 ||
        error.code === 'validation_failed' ||
        /unsupported provider|not enabled|provider/i.test(error.message ?? '');
      throw new Error(
        isProviderError
          ? 'Google sign-in is not available right now. Please sign in with email instead.'
          : 'Could not start Google sign-in. Please try again.',
      );
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // Await token exchange so caller can redirect immediately after this resolves
    if (data.session?.access_token) {
      await exchangeSupabaseToken(data.session.access_token);
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      if (error.status === 429 || /rate limit/i.test(error.message ?? '')) {
        throw new Error(
          'Too many sign-up attempts. Supabase allows 4 emails per hour on the free tier. Please wait a few minutes and try again.',
        );
      }
      throw new Error(error.message ?? 'Sign-up failed. Please try again.');
    }

    // Supabase silently "succeeds" for already-confirmed accounts — data.user is null, no email sent.
    if (!data.user) {
      throw new Error(
        'An account with this email already exists. Please sign in instead.',
      );
    }
  };

  const resendVerificationEmail = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(FLARE_TOKEN_KEY);
    setUser(null);
    setSupabaseUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, supabaseUser, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, resendVerificationEmail, signOut, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
