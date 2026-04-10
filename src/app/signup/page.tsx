'use client';

import React, { useState } from 'react';
import { useSignUp } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Calendar, RotateCw } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const signUp = useSignUp();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    confirmPassword: '',
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
    
    // Validation
    if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await signUp.mutateAsync({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth,
      });

      // Success - redirect to home dashboard page
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-outline-variant/10">
          <div className="mb-8">
            <h1 className="font-serif text-4xl text-on-surface mb-2">Create Account</h1>
            <p className="text-on-surface-variant italic">Join our clinical platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant/20 focus:border-primary focus:ring-0 transition-all"
                    placeholder="John"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
                  Last Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant/20 focus:border-primary focus:ring-0 transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

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
                />
              </div>
            </div>

            {/* Date of Birth Field */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant/20 focus:border-primary focus:ring-0 transition-all"
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
                />
              </div>
              <p className="text-xs text-on-surface-variant">Minimum 6 characters</p>
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant/20 focus:border-primary focus:ring-0 transition-all"
                  placeholder="••••••••"
                />
              </div>
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
              disabled={signUp.isPending}
              className="w-full bg-primary text-white py-4 rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {signUp.isPending ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Sign In Link */}
            <p className="text-center text-on-surface-variant text-sm">
              Already have an account?{' '}
              <a href="/signin" className="text-primary font-bold hover:underline">
                Sign In
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
