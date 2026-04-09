import Image from 'next/image';
import Link from 'next/link';
import type { Retreat } from '@/types/database';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  coming_soon: { label: 'Coming Soon', color: 'bg-yellow-900/60 text-yellow-300 border border-yellow-700/40' },
  available: { label: 'Available', color: 'bg-green-900/60 text-green-300 border border-green-700/40' },
  sold_out: { label: 'Sold Out', color: 'bg-red-900/60 text-red-300 border border-red-700/40' },
  completed: { label: 'Completed', color: 'bg-gray-800 text-gray-400 border border-gray-700' },
};

export default function RetreatCard({ retreat }: { retreat: Retreat }) {
  const statusInfo = STATUS_LABELS[retreat.status] || STATUS_LABELS.coming_soon;
  const heroImage = retreat.hero_image || retreat.images?.[0] || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800';

  return (
    <Link href={`/retreats/${retreat.slug}`} className="group card-dark block hover:border-burnt-orange transition-colors">
      <div className="relative h-56 overflow-hidden">
        <Image
          src={heroImage}
          alt={retreat.name}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <span className={`status-badge text-xs px-2.5 py-1 ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-heading text-2xl text-off-white group-hover:text-burnt-orange transition-colors leading-tight">
              {retreat.name}
            </h3>
            <p className="text-gray-500 font-body text-sm mt-1">
              {retreat.location}, {retreat.country}
            </p>
          </div>
          <div className="text-right shrink-0 ml-4">
            <p className="text-burnt-orange font-heading text-xl">€{retreat.price_euros.toLocaleString()}</p>
            <p className="text-gray-600 font-body text-xs">per person</p>
          </div>
        </div>
        {retreat.tagline && (
          <p className="text-gray-400 font-body text-sm leading-relaxed mb-4 line-clamp-2">
            {retreat.tagline}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500 font-body">
            <span>{retreat.duration_days} days</span>
            {retreat.status === 'available' && (
              <>
                <span>·</span>
                <span>{retreat.spots_remaining} spots left</span>
              </>
            )}
          </div>
          {retreat.activity_tags && retreat.activity_tags.length > 0 && (
            <div className="flex gap-1">
              {retreat.activity_tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-dark-bg border border-dark-border text-gray-500 px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
