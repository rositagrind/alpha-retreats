'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80"
          alt="Wilderness landscape"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-dark-bg" />
      </div>

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
          <p className="font-body text-gray-300 text-xl sm:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Premium men-only retreat experiences. 3–7 days of ice baths, wilderness, fire, and brotherhood. Global locations.
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
    </section>
  );
}
