'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

const FRAME_COUNT = 20;
const FRAME_SRC = (n: number) => `/axe-frames/axe-${String(n).padStart(2, '0')}.webp`;
// The last frame is reached once the hero has scrolled this fraction of its
// height off-screen, so the strike lands while it's still mostly visible.
const FINISH_AT = 0.6;

type Frame = { source: CanvasImageSource; w: number; h: number };

/**
 * Scroll-scrubbed axe animation, drawn onto a single <canvas>.
 *
 * - Every frame is fetched and fully decoded up front (img.decode() →
 *   ImageBitmap), so the first pass is as smooth as later ones (stacked <img>s
 *   decoded lazily and stuttered the first time through).
 * - The frame follows the scroll position directly (no spring or JS parallax),
 *   so the page always scrolls natively and the animation never drives it.
 * - The position between frames is fractional and adjacent frames are
 *   cross-faded, so with only 20 source frames the motion still reads as
 *   continuous rather than as hard cuts.
 */
export default function AxeScrollBackground({
  wrapperRef,
}: {
  wrapperRef: React.RefObject<HTMLElement>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frames = useRef<(Frame | null)[]>(Array(FRAME_COUNT).fill(null));
  const pos = useRef(1); // fractional frame position wanted, 1 … FRAME_COUNT
  const drawn = useRef(-1); // position last painted (-1 = needs repaint)
  const raf = useRef(0);
  const reducedMotion = useRef(false);
  const warmed = useRef(new Set<number>()); // frames already uploaded to the GPU

  const nearestLoaded = (want: number): Frame | null => {
    for (let d = 0; d < FRAME_COUNT; d++) {
      for (const c of [want - d, want + d]) {
        if (c >= 1 && c <= FRAME_COUNT && frames.current[c - 1]) return frames.current[c - 1];
      }
    }
    return null;
  };

  const draw = useCallback(() => {
    raf.current = 0;
    const canvas = canvasRef.current;
    if (!canvas || !canvas.width) return;
    const p = reducedMotion.current ? FRAME_COUNT : pos.current;
    if (Math.abs(p - drawn.current) < 0.005) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const paint = (frame: Frame, alpha: number) => {
      // object-fit: cover, centred
      const scale = Math.max(canvas.width / frame.w, canvas.height / frame.h);
      const w = frame.w * scale;
      const h = frame.h * scale;
      ctx.globalAlpha = alpha;
      ctx.drawImage(frame.source, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    };

    // Warm-up: the first drawImage of a bitmap uploads it to the GPU, which is
    // what made the first pass stutter. Draw every newly loaded frame once
    // here (at load time, not mid-scroll); the correct frame is painted over
    // it below in the same task, so nothing visible flashes.
    frames.current.forEach((f, i) => {
      if (f && !warmed.current.has(i)) {
        paint(f, 1);
        warmed.current.add(i);
      }
    });

    const base = Math.floor(p);
    const t = p - base;
    const a = frames.current[base - 1];
    const b = base < FRAME_COUNT ? frames.current[base] : null;

    if (a) {
      paint(a, 1);
      if (b && t > 0.01) paint(b, t); // cross-fade toward the next frame
    } else {
      const fallback = nearestLoaded(Math.round(p));
      if (!fallback) return;
      paint(fallback, 1);
    }
    ctx.globalAlpha = 1;
    drawn.current = p;
  }, []);

  const schedule = useCallback(() => {
    if (!raf.current) raf.current = requestAnimationFrame(draw);
  }, [draw]);

  // Load + decode every frame (frame 1 first, at high priority).
  useEffect(() => {
    let cancelled = false;
    const load = async (n: number) => {
      const img = new window.Image();
      img.decoding = 'async';
      if (n === 1) img.fetchPriority = 'high';
      img.src = FRAME_SRC(n);
      try {
        await img.decode();
        let frame: Frame = { source: img, w: img.naturalWidth, h: img.naturalHeight };
        if ('createImageBitmap' in window) {
          try {
            const bmp = await createImageBitmap(img);
            frame = { source: bmp, w: bmp.width, h: bmp.height };
          } catch {
            /* keep the decoded <img> */
          }
        }
        if (cancelled) return;
        frames.current[n - 1] = frame;
        drawn.current = -1; // what can be painted may have changed
        schedule();
      } catch {
        /* frame failed to load: neighbours will be shown instead */
      }
    };
    load(1).then(() => {
      for (let i = 2; i <= FRAME_COUNT; i++) load(i);
    });
    return () => {
      cancelled = true;
    };
  }, [schedule]);

  // Keep the canvas backing store matched to its on-screen size.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      drawn.current = -1; // resizing clears the canvas
      schedule();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [schedule]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      reducedMotion.current = mq.matches;
      drawn.current = -1;
      schedule();
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [schedule]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  // Progress 0 → 1 as the (normal-flow) hero scrolls from its resting position
  // to fully off the top of the viewport.
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end start'],
  });

  // The frame is a pure function of the current scroll position: no spring,
  // no easing, no JS-driven parallax. The page scrolls natively and the
  // animation simply follows wherever it is (an earlier spring made the frames
  // lag and "catch up", and a JS parallax transform jittered against the page
  // whenever the main thread was busy, e.g. on a first visit).
  const positionFor = (progress: number) =>
    1 + Math.min(1, Math.max(0, progress / FINISH_AT)) * (FRAME_COUNT - 1);

  // Pick up the initial scroll position (e.g. page reloaded mid-hero).
  useEffect(() => {
    pos.current = positionFor(scrollYProgress.get());
    schedule();
  }, [scrollYProgress, schedule]);

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    pos.current = positionFor(progress);
    schedule();
  });

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Server-rendered poster of frame 1: visible on first paint, before the
          JS has loaded/hydrated, so a first-time visitor never sees an empty
          hero. The canvas (transparent until it draws) covers it afterwards. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={FRAME_SRC(1)}
        alt=""
        fetchPriority="high"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {/* Fine wood-grain texture + dark overlay + subtle grain, per the Nov 2026 visual spec.
          Overlay lightened twice per Salvador's feedback that the frames read as too shaded:
          now 30% black on phones, 40% from tablet up (was 50% / 65%). Still a touch darker on
          wider viewports, where the hero copy sits over more of the image. */}
      <div className="absolute inset-0 bg-black/30 sm:bg-black/40" />
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
