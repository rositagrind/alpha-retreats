'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

/**
 * Homepage video block, replacing the old "WHAT IS ALPHA RETREATS?" text
 * section (Nov 2026 revamp). Ships as a placeholder until Salvador supplies
 * a YouTube video ID — once `youtubeId` is set below, this becomes a
 * clickable thumbnail that swaps in a privacy-friendly (youtube-nocookie)
 * embed on click, so nothing autoplays or loads off-page until the visitor
 * actually wants it.
 */
const YOUTUBE_ID = ''; // TODO: paste the real YouTube video ID here when ready

export default function VideoBlock() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="section-padding bg-dark-bg">
      <div className="container-wide">
        <div className="relative max-w-4xl mx-auto aspect-video rounded-lg overflow-hidden border border-dark-border bg-dark-card">
          {YOUTUBE_ID && playing ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?autoplay=1`}
              title="Alpha Retreats"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => YOUTUBE_ID && setPlaying(true)}
              disabled={!YOUTUBE_ID}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 w-full h-full group disabled:cursor-default"
            >
              <span className="w-16 h-16 rounded-full bg-burnt-orange/90 flex items-center justify-center group-hover:bg-burnt-orange transition-colors">
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              </span>
              <span className="font-heading text-2xl text-off-white tracking-widest">
                {YOUTUBE_ID ? 'WATCH THE FILM' : 'VIDEO'}
              </span>
              {!YOUTUBE_ID && (
                <span className="font-body text-gray-500 text-sm">Coming soon</span>
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
