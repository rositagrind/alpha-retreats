'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import TiptapEditor from './TiptapEditor';
import type { Retreat, ItineraryDay } from '@/types/database';
import { Plus, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';

const ALL_ACTIVITIES = [
  'Ice Baths', 'Wilderness Hiking', 'Fire Cooking', 'Axe Throwing',
  'Motorcycling', 'Cabin Building', 'Fishing', 'Animal Butchery', 'Gym Training', 'Chopping Wood',
];

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

interface FormData {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  location: string;
  country: string;
  duration_days: string;
  start_date: string;
  end_date: string;
  max_capacity: string;
  spots_remaining: string;
  price_euros: string;
  deposit_euros: string;
  status: string;
  featured: boolean;
  activity_tags: string[];
  itinerary: ItineraryDay[];
  included: string[];
  not_included: string[];
  images: string[];
  hero_image: string;
  meta_title: string;
  meta_description: string;
}

export default function RetreatForm({ retreat }: { retreat?: Retreat }) {
  const router = useRouter();
  const isEdit = !!retreat;

  const [form, setForm] = useState<FormData>({
    name: retreat?.name || '',
    slug: retreat?.slug || '',
    tagline: retreat?.tagline || '',
    description: retreat?.description || '',
    location: retreat?.location || '',
    country: retreat?.country || '',
    duration_days: String(retreat?.duration_days || '5'),
    start_date: retreat?.start_date || '',
    end_date: retreat?.end_date || '',
    max_capacity: String(retreat?.max_capacity || '12'),
    spots_remaining: String(retreat?.spots_remaining || '12'),
    price_euros: String(retreat?.price_euros || ''),
    deposit_euros: String(retreat?.deposit_euros || '500'),
    status: retreat?.status || 'draft',
    featured: retreat?.featured || false,
    activity_tags: retreat?.activity_tags || [],
    itinerary: (retreat?.itinerary as ItineraryDay[]) || [],
    included: retreat?.included || [''],
    not_included: retreat?.not_included || [''],
    images: retreat?.images || [],
    hero_image: retreat?.hero_image || '',
    meta_title: retreat?.meta_title || '',
    meta_description: retreat?.meta_description || '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);

  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      slug: isEdit ? f.slug : slugify(name),
    }));
  };

  const toggleActivity = (tag: string) => {
    setForm((f) => ({
      ...f,
      activity_tags: f.activity_tags.includes(tag)
        ? f.activity_tags.filter((t) => t !== tag)
        : [...f.activity_tags, tag],
    }));
  };

  const addItineraryDay = () => {
    setForm((f) => ({
      ...f,
      itinerary: [...f.itinerary, { day: f.itinerary.length + 1, title: '', description: '' }],
    }));
  };

  const updateItineraryDay = (i: number, field: keyof ItineraryDay, value: string | number) => {
    setForm((f) => {
      const updated = [...f.itinerary];
      updated[i] = { ...updated[i], [field]: value };
      return { ...f, itinerary: updated };
    });
  };

  const removeItineraryDay = (i: number) => {
    setForm((f) => {
      const updated = f.itinerary.filter((_, idx) => idx !== i).map((d, idx) => ({ ...d, day: idx + 1 }));
      return { ...f, itinerary: updated };
    });
  };

  const updateListItem = (field: 'included' | 'not_included', i: number, value: string) => {
    setForm((f) => {
      const updated = [...f[field]];
      updated[i] = value;
      return { ...f, [field]: updated };
    });
  };

  const addListItem = (field: 'included' | 'not_included') => {
    setForm((f) => ({ ...f, [field]: [...f[field], ''] }));
  };

  const removeListItem = (field: 'included' | 'not_included', i: number) => {
    setForm((f) => ({ ...f, [field]: f[field].filter((_, idx) => idx !== i) }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const invalid = files.find((f) => !['image/jpeg', 'image/png', 'image/webp'].includes(f.type));
    if (invalid) { alert('Only JPG, PNG, and WebP images are allowed.'); return; }

    const oversized = files.find((f) => f.size > 20 * 1024 * 1024);
    if (oversized) { alert(`"${oversized.name}" exceeds the 20MB limit.`); return; }

    setUploadProgress({ done: 0, total: files.length });
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated. Please log in and try again.');

      const urls: string[] = [];
      for (const file of files) {
        const ext = file.name.split('.').pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('retreat-images').upload(path, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('retreat-images').getPublicUrl(path);
        urls.push(publicUrl);
        setUploadProgress((p) => p ? { ...p, done: p.done + 1 } : null);
      }
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploadProgress(null);
      e.target.value = '';
    }
  };

  const removeImage = (url: string) => {
    setForm((f) => ({
      ...f,
      images: f.images.filter((img) => img !== url),
      hero_image: f.hero_image === url ? '' : f.hero_image,
    }));
  };

  const validate = () => {
    if (!form.name.trim()) return 'Name is required.';
    if (!form.slug.trim()) return 'Slug is required.';
    if (!form.location.trim()) return 'Location is required.';
    if (!form.country.trim()) return 'Country is required.';
    if (!form.price_euros || isNaN(Number(form.price_euros))) return 'Valid price is required.';
    if (!form.duration_days || isNaN(Number(form.duration_days))) return 'Valid duration is required.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); setStatus('error'); return; }
    setStatus('loading');
    setError('');

    const supabase = createClient();
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      tagline: form.tagline.trim() || null,
      description: form.description || null,
      location: form.location.trim(),
      country: form.country.trim(),
      duration_days: Number(form.duration_days),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      max_capacity: Number(form.max_capacity),
      spots_remaining: Number(form.spots_remaining),
      price_euros: Number(form.price_euros),
      deposit_euros: Number(form.deposit_euros),
      status: form.status as Retreat['status'],
      featured: form.featured,
      activity_tags: form.activity_tags,
      itinerary: form.itinerary,
      included: form.included.filter(Boolean),
      not_included: form.not_included.filter(Boolean),
      images: form.images,
      hero_image: form.hero_image || null,
      meta_title: form.meta_title.trim() || null,
      meta_description: form.meta_description.trim() || null,
    };

    const { error: saveError } = isEdit
      ? await supabase.from('retreats').update(payload).eq('id', retreat!.id)
      : await supabase.from('retreats').insert(payload);

    if (saveError) {
      setStatus('error');
      setError(saveError.message || 'Failed to save retreat.');
      return;
    }
    setStatus('success');
    router.push('/admin/retreats');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Basic Info */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h2 className="font-heading text-xl text-off-white mb-5">BASIC INFORMATION</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-dark">Retreat Name *</label>
            <input className="input-dark" value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Iron Brotherhood" />
          </div>
          <div>
            <label className="label-dark">Slug *</label>
            <input className="input-dark" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="iron-brotherhood" />
          </div>
          <div className="sm:col-span-2">
            <label className="label-dark">Tagline</label>
            <input className="input-dark" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Short punchy description" />
          </div>
          <div>
            <label className="label-dark">Location *</label>
            <input className="input-dark" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Banff" />
          </div>
          <div>
            <label className="label-dark">Country *</label>
            <input className="input-dark" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Canada" />
          </div>
        </div>
      </div>

      {/* Logistics */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h2 className="font-heading text-xl text-off-white mb-5">LOGISTICS & PRICING</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="label-dark">Duration (days) *</label>
            <input className="input-dark" type="number" min="1" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: e.target.value })} />
          </div>
          <div>
            <label className="label-dark">Start Date</label>
            <input className="input-dark" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </div>
          <div>
            <label className="label-dark">End Date</label>
            <input className="input-dark" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </div>
          <div>
            <label className="label-dark">Max Capacity</label>
            <input className="input-dark" type="number" min="1" value={form.max_capacity} onChange={(e) => setForm({ ...form, max_capacity: e.target.value })} />
          </div>
          <div>
            <label className="label-dark">Spots Remaining</label>
            <input className="input-dark" type="number" min="0" value={form.spots_remaining} onChange={(e) => setForm({ ...form, spots_remaining: e.target.value })} />
          </div>
          <div>
            <label className="label-dark">Price (€) *</label>
            <input className="input-dark" type="number" min="0" value={form.price_euros} onChange={(e) => setForm({ ...form, price_euros: e.target.value })} placeholder="3500" />
          </div>
          <div>
            <label className="label-dark">Deposit (€)</label>
            <input className="input-dark" type="number" min="0" value={form.deposit_euros} onChange={(e) => setForm({ ...form, deposit_euros: e.target.value })} />
          </div>
          <div>
            <label className="label-dark">Status</label>
            <select className="input-dark" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="coming_soon">Coming Soon</option>
              <option value="available">Available</option>
              <option value="sold_out">Sold Out</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="featured"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="w-4 h-4 accent-burnt-orange"
            />
            <label htmlFor="featured" className="font-body text-sm text-gray-300">Featured on homepage</label>
          </div>
        </div>
      </div>

      {/* Activities */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h2 className="font-heading text-xl text-off-white mb-5">ACTIVITIES</h2>
        <div className="flex flex-wrap gap-2">
          {ALL_ACTIVITIES.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleActivity(tag)}
              className={`font-body text-sm px-4 py-2 rounded border transition-colors ${
                form.activity_tags.includes(tag)
                  ? 'bg-burnt-orange/20 border-burnt-orange text-off-white'
                  : 'bg-dark-bg border-dark-border text-gray-500 hover:border-gray-500'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h2 className="font-heading text-xl text-off-white mb-5">DESCRIPTION</h2>
        <TiptapEditor content={form.description} onChange={(html) => setForm({ ...form, description: html })} />
      </div>

      {/* Itinerary */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-xl text-off-white">ITINERARY</h2>
          <button type="button" onClick={addItineraryDay} className="flex items-center gap-2 font-body text-sm text-burnt-orange hover:text-orange-400 transition-colors">
            <Plus className="w-4 h-4" /> Add Day
          </button>
        </div>
        <div className="space-y-4">
          {form.itinerary.map((day, i) => (
            <div key={i} className="bg-dark-bg border border-dark-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-heading text-burnt-orange text-lg shrink-0">DAY {day.day}</span>
                <input
                  className="input-dark flex-1"
                  value={day.title}
                  onChange={(e) => updateItineraryDay(i, 'title', e.target.value)}
                  placeholder="Day title"
                />
                <button type="button" onClick={() => removeItineraryDay(i)} className="text-red-500 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <textarea
                className="input-dark min-h-[80px] resize-none text-sm"
                value={day.description}
                onChange={(e) => updateItineraryDay(i, 'description', e.target.value)}
                placeholder="What happens on this day..."
              />
            </div>
          ))}
          {form.itinerary.length === 0 && (
            <p className="text-gray-600 font-body text-sm text-center py-6">No itinerary days yet. Click &ldquo;Add Day&rdquo; to start.</p>
          )}
        </div>
      </div>

      {/* Included / Not Included */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {(['included', 'not_included'] as const).map((field) => (
          <div key={field} className="bg-dark-card border border-dark-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg text-off-white">{field === 'included' ? 'INCLUDED' : 'NOT INCLUDED'}</h2>
              <button type="button" onClick={() => addListItem(field)} className="text-burnt-orange hover:text-orange-400">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {form[field].map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input-dark text-sm flex-1"
                    value={item}
                    onChange={(e) => updateListItem(field, i, e.target.value)}
                    placeholder={field === 'included' ? 'e.g. All meals' : 'e.g. Flights'}
                  />
                  <button type="button" onClick={() => removeListItem(field, i)} className="text-red-500 hover:text-red-400 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Images */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h2 className="font-heading text-xl text-off-white mb-5">IMAGES</h2>
        <label className={`flex items-center gap-3 border-2 border-dashed rounded-lg p-6 transition-colors mb-4 ${uploadProgress ? 'border-burnt-orange cursor-not-allowed' : 'border-dark-border hover:border-burnt-orange cursor-pointer'}`}>
          <Upload className="w-5 h-5 text-gray-500 shrink-0" />
          <div className="flex-1 min-w-0">
            {uploadProgress ? (
              <div>
                <p className="font-body text-sm text-burnt-orange mb-1.5">Uploading {uploadProgress.done}/{uploadProgress.total}...</p>
                <div className="w-full bg-dark-border rounded-full h-1.5">
                  <div
                    className="bg-burnt-orange h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${(uploadProgress.done / uploadProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="font-body text-sm text-gray-300">Click to upload images (JPG, PNG, WebP — max 20MB each, multiple allowed)</p>
            )}
          </div>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImageUpload} disabled={!!uploadProgress} className="hidden" />
        </label>
        {form.images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {form.images.map((img, i) => (
              <div key={i} className="relative group">
                <div className="relative w-full h-32">
                  <Image src={img} alt={`Image ${i + 1}`} fill className="object-cover rounded-lg" sizes="(max-width: 640px) 50vw, 33vw" />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, hero_image: img }))}
                    className={`font-body text-xs px-2 py-1 rounded ${form.hero_image === img ? 'bg-burnt-orange text-white' : 'bg-dark-card text-gray-300 hover:bg-burnt-orange/20'}`}
                  >
                    {form.hero_image === img ? '✓ Hero' : 'Set Hero'}
                  </button>
                  <button type="button" onClick={() => removeImage(img)} className="bg-red-900/80 text-red-300 px-2 py-1 rounded font-body text-xs">
                    Remove
                  </button>
                </div>
                {form.hero_image === img && (
                  <div className="absolute top-2 left-2 bg-burnt-orange text-white text-xs font-body px-1.5 py-0.5 rounded">HERO</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEO */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h2 className="font-heading text-xl text-off-white mb-5">SEO</h2>
        <div className="space-y-4">
          <div>
            <label className="label-dark">Meta Title</label>
            <input className="input-dark" value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} placeholder="Iron Brotherhood — 7-Day Men's Expedition | Alpha Retreats" />
            <p className="text-gray-600 font-body text-xs mt-1">{form.meta_title.length}/60 characters</p>
          </div>
          <div>
            <label className="label-dark">Meta Description</label>
            <textarea className="input-dark min-h-[80px] resize-none" value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} placeholder="The flagship Alpha Retreats experience..." />
            <p className="text-gray-600 font-body text-xs mt-1">{form.meta_description.length}/160 characters</p>
          </div>
        </div>
      </div>

      {error && <p className="text-red-400 font-body text-sm bg-red-900/20 border border-red-900/40 rounded p-3">{error}</p>}

      <div className="flex items-center gap-4">
        <Button type="submit" loading={status === 'loading'} size="lg">
          {isEdit ? 'Save Changes' : 'Create Retreat'}
        </Button>
        <button type="button" onClick={() => router.back()} className="font-body text-sm text-gray-500 hover:text-gray-300 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
