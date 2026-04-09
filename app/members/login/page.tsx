'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function MembersLoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/members`,
      },
    });
    if (error) {
      setStatus('error');
      setMessage(error.message || 'Failed to send magic link. Please try again.');
    } else {
      setStatus('success');
      setMessage('Check your email — we sent you a magic link to sign in.');
    }
  };

  return (
    <main className="pt-20 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <Link href="/" className="font-heading text-2xl text-off-white tracking-widest hover:text-burnt-orange transition-colors">
            ALPHA RETREATS
          </Link>
          <h1 className="heading-md mt-6 mb-2">MEMBERS AREA</h1>
          <p className="text-gray-400 font-body text-sm">
            Enter your email and we will send you a magic link to sign in.
          </p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-lg p-8">
          {status === 'success' ? (
            <div className="text-center">
              <div className="text-4xl mb-4">📬</div>
              <p className="font-heading text-xl text-off-white mb-2">CHECK YOUR EMAIL</p>
              <p className="text-gray-400 font-body text-sm">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label-dark">Email Address</label>
                <input
                  type="email"
                  className="input-dark"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              {status === 'error' && <p className="text-red-400 font-body text-sm">{message}</p>}
              <Button type="submit" loading={status === 'loading'} className="w-full">
                Send Magic Link
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-gray-600 font-body text-xs mt-6">
          Not a member yet?{' '}
          <Link href="/retreats" className="text-burnt-orange hover:text-orange-400 transition-colors">
            Book a retreat
          </Link>
        </p>
      </div>
    </main>
  );
}
