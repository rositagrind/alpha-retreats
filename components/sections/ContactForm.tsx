'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const validate = () => {
    if (!form.name.trim()) return 'Name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Valid email is required.';
    if (!form.message.trim() || form.message.trim().length < 10) return 'Please write a message (at least 10 characters).';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setStatus('error'); setMessage(err); return; }
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Message sent. We will get back to you within 24 hours.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to send message.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-dark-card border border-green-900/40 rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">✓</div>
        <p className="font-heading text-2xl text-burnt-orange mb-2">MESSAGE SENT.</p>
        <p className="text-gray-400 font-body">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="label-dark">Name *</label>
          <input
            className="input-dark"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="James Whitmore"
          />
        </div>
        <div>
          <label className="label-dark">Email *</label>
          <input
            className="input-dark"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="james@example.com"
          />
        </div>
      </div>
      <div>
        <label className="label-dark">Subject</label>
        <input
          className="input-dark"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          placeholder="Question about Iron Brotherhood"
        />
      </div>
      <div>
        <label className="label-dark">Message *</label>
        <textarea
          className="input-dark min-h-[140px] resize-none"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Your message here..."
        />
      </div>
      {status === 'error' && <p className="text-red-400 font-body text-sm">{message}</p>}
      <Button type="submit" loading={status === 'loading'} size="lg">
        Send Message
      </Button>
    </form>
  );
}
