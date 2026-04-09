'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function CorporateForm() {
  const [form, setForm] = useState({
    company_name: '', contact_name: '', email: '', phone: '',
    team_size: '', preferred_dates: '', goals: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const validate = () => {
    if (!form.company_name.trim()) return 'Company name is required.';
    if (!form.contact_name.trim()) return 'Your name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Valid email is required.';
    if (!form.goals.trim()) return 'Please describe your goals.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setStatus('error'); setMessage(err); return; }
    setStatus('loading');
    try {
      const res = await fetch('/api/enquiries/corporate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, team_size: form.team_size ? Number(form.team_size) : null }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Your enquiry has been received. We will be in touch within 24 hours.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to submit enquiry. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please check your connection.');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-dark-card border border-green-900/40 rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">✓</div>
        <p className="font-heading text-2xl text-burnt-orange mb-2">ENQUIRY RECEIVED.</p>
        <p className="text-gray-400 font-body">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="label-dark">Company Name *</label>
          <input
            className="input-dark"
            value={form.company_name}
            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
            placeholder="Whitmore Capital"
          />
        </div>
        <div>
          <label className="label-dark">Your Name *</label>
          <input
            className="input-dark"
            value={form.contact_name}
            onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
            placeholder="James Whitmore"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="label-dark">Email *</label>
          <input
            className="input-dark"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="james@company.com"
          />
        </div>
        <div>
          <label className="label-dark">Phone</label>
          <input
            className="input-dark"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+44 7700 000000"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="label-dark">Team Size</label>
          <input
            className="input-dark"
            type="number"
            min="5"
            max="500"
            value={form.team_size}
            onChange={(e) => setForm({ ...form, team_size: e.target.value })}
            placeholder="e.g. 20"
          />
        </div>
        <div>
          <label className="label-dark">Preferred Dates</label>
          <input
            className="input-dark"
            value={form.preferred_dates}
            onChange={(e) => setForm({ ...form, preferred_dates: e.target.value })}
            placeholder="e.g. Q3 2025, Sept–Oct"
          />
        </div>
      </div>
      <div>
        <label className="label-dark">Goals & What You Want To Achieve *</label>
        <textarea
          className="input-dark min-h-[120px] resize-none"
          value={form.goals}
          onChange={(e) => setForm({ ...form, goals: e.target.value })}
          placeholder="Tell us about your team, what challenges you face, and what you want to walk away with..."
        />
      </div>
      {status === 'error' && <p className="text-red-400 font-body text-sm">{message}</p>}
      <Button type="submit" loading={status === 'loading'} size="lg">
        Submit Enquiry
      </Button>
    </form>
  );
}
