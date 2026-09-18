'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { trackEvent } from '@/lib/analytics';

export default function WaitlistForm({ source = 'homepage' }: { source?: string }) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, source }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'You\'re on the list. We\'ll be in touch.');
        trackEvent('waitlist_signup', { source });
        setEmail('');
        setFirstName('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">✓</div>
        <p className="font-heading text-2xl text-burnt-orange mb-2">YOU&apos;RE IN.</p>
        <p className="text-gray-400 font-body">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="input-dark flex-1"
        />
        <input
          type="email"
          placeholder="Email Address *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-dark flex-1"
        />
        <Button type="submit" loading={status === 'loading'} className="whitespace-nowrap">
          Join Waitlist
        </Button>
      </div>
      {status === 'error' && (
        <p className="text-red-400 font-body text-sm">{message}</p>
      )}
    </form>
  );
}
