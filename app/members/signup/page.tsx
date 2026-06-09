'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function MembersSignupPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    whyJoin: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { firstName, lastName, email, password, whyJoin } = form;

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !whyJoin.trim()) {
      setStatus('error');
      setError('All fields are required.');
      return;
    }
    if (password.length < 8) {
      setStatus('error');
      setError('Password must be at least 8 characters.');
      return;
    }

    setStatus('loading');
    setError('');

    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({ email: email.trim(), password });

    if (signUpError || !data.user) {
      setStatus('error');
      setError(signUpError?.message || 'Failed to create account. Please try again.');
      return;
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email: email.trim(),
      full_name: `${firstName.trim()} ${lastName.trim()}`,
      role: 'pending',
    });

    if (profileError) {
      setStatus('error');
      setError('Account created but profile setup failed. Please contact support.');
      return;
    }

    setStatus('success');
  };

  if (status === 'success') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="w-full max-w-md px-4 text-center">
          <Link href="/" className="font-heading text-2xl text-off-white tracking-widest hover:text-burnt-orange transition-colors">
            ALPHA RETREATS
          </Link>
          <div className="bg-dark-card border border-dark-border rounded-lg p-10 mt-8">
            <p className="font-heading text-2xl text-burnt-orange mb-4">APPLICATION RECEIVED</p>
            <p className="text-gray-400 font-body text-sm leading-relaxed">
              Your application has been received. We&apos;ll review it and be in touch.
            </p>
          </div>
          <p className="text-center text-gray-600 font-body text-xs mt-6">
            Already approved?{' '}
            <Link href="/members/login" className="text-burnt-orange hover:text-orange-400 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-dark-bg py-12">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <Link href="/" className="font-heading text-2xl text-off-white tracking-widest hover:text-burnt-orange transition-colors">
            ALPHA RETREATS
          </Link>
          <h1 className="heading-md mt-6 mb-2">APPLY FOR MEMBERSHIP</h1>
          <p className="text-gray-600 font-body text-xs">Applications are reviewed by our team.</p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-dark">First Name</label>
                <input
                  type="text"
                  className="input-dark"
                  value={form.firstName}
                  onChange={set('firstName')}
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="label-dark">Last Name</label>
                <input
                  type="text"
                  className="input-dark"
                  value={form.lastName}
                  onChange={set('lastName')}
                  placeholder="Smith"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label-dark">Email</label>
              <input
                type="email"
                className="input-dark"
                value={form.email}
                onChange={set('email')}
                placeholder="your@email.com"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="label-dark">Password</label>
              <input
                type="password"
                className="input-dark"
                value={form.password}
                onChange={set('password')}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                required
              />
            </div>
            <div>
              <label className="label-dark">Why do you want to join?</label>
              <textarea
                className="input-dark resize-none"
                rows={3}
                value={form.whyJoin}
                onChange={set('whyJoin')}
                placeholder="Tell us a bit about yourself and why you want to join..."
                required
              />
            </div>
            {status === 'error' && (
              <p className="text-red-400 font-body text-sm bg-red-900/20 border border-red-900/40 rounded p-3">
                {error}
              </p>
            )}
            <Button type="submit" loading={status === 'loading'} className="w-full">
              Submit Application
            </Button>
          </form>
        </div>

        <p className="text-center text-gray-600 font-body text-xs mt-6">
          Already a member?{' '}
          <Link href="/members/login" className="text-burnt-orange hover:text-orange-400 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
