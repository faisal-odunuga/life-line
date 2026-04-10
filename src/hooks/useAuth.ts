import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface SignUpData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
}

export const useSignUp = () => {
  return useMutation({
    mutationFn: async (data: SignUpData) => {
      // Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
            date_of_birth: data.date_of_birth,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Sign up failed');

      return authData;
    },
  });
};

export const useSignIn = () => {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    },
  });
};

export const useSignOut = () => {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  });
};

export const useCurrentUser = () => {
  return supabase.auth.onAuthStateChange((event, session) => {
    return session?.user;
  });
};

// Get current user (one-time)
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};
