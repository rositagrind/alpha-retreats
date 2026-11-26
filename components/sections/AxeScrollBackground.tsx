'use client';

import { useEffect, useRef, useState } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

const FRAME_COUNT = 20;
const FRAME_SRC = (n: number) => `/axe-frames/axe-${String(n).padStart(2, '0')}.webp`;

export default function AxeScrollBackground({
  wrapperRef,
}: {
  wrapperRef: React.RefObject<HTMLElement>;
}) {
  const [frame, setFrame] = useState(1);
  const [reducedMotion, setReducedMotion] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    // Preload every frame once, eagerly, so scrubbing never shows a blank frame.
    if (loaded.current) return;
    loaded.current = true;
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new window.Image();
      img.src = FRAME_SRC(i);
    }
  }, []);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    if (reducedMotion) return;
    const next = Math.min(FRAME_COUNT, Math.max(1, Math.round(progress * (FRAME_COUNT - 1)) + 1));
    setFrame((prev) => (prev === next ? prev : next));
  });

  const activeFrame = reducedMotion ? FRAME_COUNT : frame;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: FRAME_COUNT }, (_, i) => i + 1).map((n) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={n}
          src={FRAME_SRC(n)}
          alt=""
          decoding="async"
          fetchPriority={n === 1 ? 'high' : 'low'}
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ opacity: n === activeFrame ? 1 : 0 }}
        />
      ))}
      {/* Fine wood-grain texture + dark overlay + subtle grain, per the Nov 2026 visual spec.
          Lighter on phones (50% black) per Salvador's feedback that the mobile hero read as
          too dark/hard to track the animation in; unchanged (65%) from tablet up, where the
          image occupies proportionally less of a wider, shorter viewport. */}
      <div className="absolute inset-0 bg-black/50 sm:bg-black/65" />
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-dark-bg" />
    </div>
  );
}
