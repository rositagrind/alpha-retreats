'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AxeScrollBackground from './AxeScrollBackground';

export default function HeroSection() {
  const wrapperRef = useRef<HTMLElement>(null);

  return (
    // Tall scroll track: the sticky panel inside stays pinned while the axe
    // animation scrubs through its 20 frames across this height, then normal
    // page flow resumes (video block, etc.) once the user scrolls past it.
    <section ref={wrapperRef} className="relative h-[220vh]">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <AxeScrollBackground wrapperRef={wrapperRef} />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <p className="font-body text-burnt-orange uppercase tracking-widest text-sm mb-6 font-semibold">
              Built for Men. Forged in the Wild.
            </p>
            <h1 className="font-heading text-6xl sm:text-8xl lg:text-9xl text-off-white leading-none mb-6">
              WHERE MEN<br />
              <span className="text-burnt-orange">ARE FORGED.</span>
            </h1>
            <p className="font-body text-gray-300 text-lg sm:text-2xl max-w-xl mx-auto mb-10 leading-relaxed">
              Disconnect from the noise. Get your hands dirty. Remember what you&apos;re made of.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/retreats"
                className="bg-burnt-orange text-white font-body font-semibold text-sm uppercase tracking-widest px-10 py-4 rounded hover:bg-orange-700 transition-colors w-full sm:w-auto text-center"
              >
                Explore Retreats
              </Link>
              <Link
                href="/corporate"
                className="border border-off-white text-off-white font-body font-semibold text-sm uppercase tracking-widest px-10 py-4 rounded hover:bg-off-white hover:text-dark-bg transition-colors w-full sm:w-auto text-center"
              >
                For Companies
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <div className="w-px h-16 bg-gradient-to-b from-off-white/50 to-transparent mx-auto" />
        </motion.div>
      </div>
    </section>
  );
}
