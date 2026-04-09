'use client';

import { useState } from 'react';
import type { Retreat } from '@/types/database';
import Button from '@/components/ui/Button';
import WaitlistForm from './WaitlistForm';

interface BookingForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  spots: number;
}

export default function RetreatBookingPanel({ retreat }: { retreat: Retreat }) {
  const [form, setForm] = useState<BookingForm>({
    firstName: '', lastName: '', email: '', phone: '', spots: 1,
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');
  const [showBooking, setShowBooking] = useState(false);

  const canBook = retreat.status === 'available' && retreat.spots_remaining > 0;
  const comingSoon = retreat.status === 'coming_soon';

  const validate = () => {
    if (!form.firstName.trim()) return 'First name is required.';
    if (!form.lastName.trim()) return 'Last name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Valid email is required.';
    if (!form.phone.trim()) return 'Phone number is required.';
    if (form.spots < 1 || form.spots > retreat.spots_remaining) return `Spots must be between 1 and ${retreat.spots_remaining}.`;
    return null;
  };

  const handleBook = async () => {
    const err = validate();
    if (err) { setError(err); setStatus('error'); return; }
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/bookings/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, retreatId: retreat.id }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setStatus('error');
        setError(data.error || 'Failed to create checkout session.');
      }
    } catch {
      setStatus('error');
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <span className="font-heading text-3xl text-off-white">€{retreat.price_euros.toLocaleString()}</span>
          <span className="text-gray-500 font-body text-sm">per person</span>
        </div>
        <p className="text-gray-500 font-body text-xs">Deposit: €{retreat.deposit_euros.toLocaleString()} to secure your spot</p>
      </div>

      <div className="space-y-3 mb-6 text-sm font-body">
        <div className="flex justify-between">
          <span className="text-gray-500">Location</span>
          <span className="text-off-white">{retreat.location}, {retreat.country}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Duration</span>
          <span className="text-off-white">{retreat.duration_days} days</span>
        </div>
        {retreat.start_date && (
          <div className="flex justify-between">
            <span className="text-gray-500">Dates</span>
            <span className="text-off-white">
              {new Date(retreat.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">Group Size</span>
          <span className="text-off-white">Max {retreat.max_capacity} men</span>
        </div>
        {canBook && (
          <div className="flex justify-between">
            <span className="text-gray-500">Spots Remaining</span>
            <span className="text-burnt-orange font-semibold">{retreat.spots_remaining}</span>
          </div>
        )}
      </div>

      {canBook && !showBooking && (
        <Button className="w-full" onClick={() => setShowBooking(true)}>
          Book Now
        </Button>
      )}

      {canBook && showBooking && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-dark">First Name *</label>
              <input
                className="input-dark"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="James"
              />
            </div>
            <div>
              <label className="label-dark">Last Name *</label>
              <input
                className="input-dark"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="Whitmore"
              />
            </div>
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
          <div>
            <label className="label-dark">Phone *</label>
            <input
              className="input-dark"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+44 7700 000000"
            />
          </div>
          <div>
            <label className="label-dark">Spots</label>
            <select
              className="input-dark"
              value={form.spots}
              onChange={(e) => setForm({ ...form, spots: Number(e.target.value) })}
            >
              {Array.from({ length: Math.min(retreat.spots_remaining, 5) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? 'spot' : 'spots'}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-red-400 font-body text-sm">{error}</p>}
          <p className="text-gray-500 font-body text-xs">
            You will pay the deposit of €{(retreat.deposit_euros * form.spots).toLocaleString()} now via Stripe. The balance is due 30 days before the retreat.
          </p>
          <Button className="w-full" onClick={handleBook} loading={status === 'loading'}>
            Pay Deposit — €{(retreat.deposit_euros * form.spots).toLocaleString()}
          </Button>
          <button
            onClick={() => setShowBooking(false)}
            className="w-full text-gray-500 font-body text-xs hover:text-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {comingSoon && (
        <div>
          <p className="text-gray-400 font-body text-sm mb-4">
            This retreat is not yet open for booking. Join the waitlist to be first to know when spots open.
          </p>
          <WaitlistForm source={`retreat-${retreat.slug}`} />
        </div>
      )}

      {retreat.status === 'sold_out' && (
        <div>
          <p className="text-center font-heading text-xl text-gray-500 mb-4">SOLD OUT</p>
          <p className="text-gray-400 font-body text-sm mb-4">
            Join the waitlist for future dates.
          </p>
          <WaitlistForm source={`retreat-${retreat.slug}-soldout`} />
        </div>
      )}

      {retreat.status === 'completed' && (
        <p className="text-center font-heading text-xl text-gray-600">THIS RETREAT HAS ENDED</p>
      )}
    </div>
  );
}
