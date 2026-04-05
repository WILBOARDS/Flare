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
  avatarUrl: string | null;
  followerCount: number;
  followingCount: number;
  walletAddress: string | null;
  createdAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  supabaseUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
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
    } catch {
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
      if (error.message?.toLowerCase().includes('provider') || error.message?.toLowerCase().includes('not enabled')) {
        throw new Error('Google sign-in is not configured yet. Please use email/password for now.');
      }
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
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
      value={{ user, supabaseUser, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, refreshUser }}
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
