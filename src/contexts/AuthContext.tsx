'use client';

import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Patient } from '@/hooks/usePatient';

interface AuthContextType {
  user: User | null;
  profile: Patient | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  refetchProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch patient profile for authenticated user
  const fetchProfile = async (userId: string) => {
    try {
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured, skipping profile fetch');
        return;
      }

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data as Patient);
    } catch (err) {
      console.error('Error in fetchProfile:', err);
    }
  };

  // Sync auth state on mount and listen for changes
  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured. Running in demo mode.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Get initial auth state
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) {
        console.error('Auth error:', error);
        setError(error);
        setIsLoading(false);
        return;
      }

      if (user) {
        setUser(user);
        fetchProfile(user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const authUser = session?.user ?? null;

      if (authUser) {
        setUser(authUser);
        await fetchProfile(authUser.id);
      } else {
        setUser(null);
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const refetchProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    error,
    refetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
