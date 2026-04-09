'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setStatus('error');
      setError('Email and password are required.');
      return;
    }
    setStatus('loading');
    setError('');

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

    if (authError) {
      setStatus('error');
      setError('Invalid email or password.');
      return;
    }

    if (!data.user) {
      setStatus('error');
      setError('Authentication failed. Please try again.');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      await supabase.auth.signOut();
      setStatus('error');
      setError('Access denied. This account does not have admin privileges.');
      return;
    }

    router.push('/admin');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-dark-bg">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <Link href="/" className="font-heading text-2xl text-off-white tracking-widest hover:text-burnt-orange transition-colors">
            ALPHA RETREATS
          </Link>
          <h1 className="heading-md mt-6 mb-2">ADMIN ACCESS</h1>
          <p className="text-gray-600 font-body text-xs">Authorised personnel only.</p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-dark">Email</label>
              <input
                type="email"
                className="input-dark"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@alpharetreats.com"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="label-dark">Password</label>
              <input
                type="password"
                className="input-dark"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
            {status === 'error' && (
              <p className="text-red-400 font-body text-sm bg-red-900/20 border border-red-900/40 rounded p-3">
                {error}
              </p>
            )}
            <Button type="submit" loading={status === 'loading'} className="w-full">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
