'use client';

import React, { useState } from 'react';
import { useSignIn } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Mail, Lock, RotateCw } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const signIn = useSignIn();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please enter email and password');
      return;
    }

    try {
      await signIn.mutateAsync({
        email: formData.email,
        password: formData.password,
      });

      // Success - redirect to dashboard
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-outline-variant/10">
          <div className="mb-8">
            <h1 className="font-serif text-4xl text-on-surface mb-2">Welcome Back</h1>
            <p className="text-on-surface-variant italic">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant/20 focus:border-primary focus:ring-0 transition-all"
                  placeholder="john@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant/20 focus:border-primary focus:ring-0 transition-all"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a href="#" className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">
                Forgot Password?
              </a>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-error/10 border border-error/30 rounded-lg">
                <p className="text-sm font-bold text-error">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={signIn.isPending}
              className="w-full bg-primary text-white py-4 rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {signIn.isPending ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-on-surface-variant text-sm">
              Don&apos;t have an account?{' '}
              <a href="/signup" className="text-primary font-bold hover:underline">
                Create one
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
