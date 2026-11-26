'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

const FRAME_COUNT = 20;
const FRAME_SRC = (n: number) => `/axe-frames/axe-${String(n).padStart(2, '0')}.webp`;

type Frame = { source: CanvasImageSource; w: number; h: number };

/**
 * Scroll-scrubbed axe animation, drawn onto a single <canvas>.
 *
 * Why a canvas instead of 20 stacked <img>s toggled by opacity: browsers decode
 * hidden images lazily, so the first pass through the animation stuttered while
 * each frame was fetched/decoded on demand (smooth only on the second pass, once
 * everything was cached). Here every frame is fetched and fully decoded up front
 * (img.decode() → ImageBitmap), and scrolling just blits an already-decoded
 * bitmap, at most once per animation frame. Until a frame has loaded, the
 * nearest loaded frame is shown instead of a blank.
 */
export default function AxeScrollBackground({
  wrapperRef,
}: {
  wrapperRef: React.RefObject<HTMLElement>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frames = useRef<(Frame | null)[]>(Array(FRAME_COUNT).fill(null));
  const target = useRef(1); // frame the scroll position asks for
  const drawn = useRef(0); // frame currently painted (0 = nothing / needs repaint)
  const raf = useRef(0);
  const reducedMotion = useRef(false);

  const draw = useCallback(() => {
    raf.current = 0;
    const canvas = canvasRef.current;
    if (!canvas || !canvas.width) return;
    const want = reducedMotion.current ? FRAME_COUNT : target.current;

    // Nearest loaded frame to the one we want (ties go to the earlier frame).
    let frame: Frame | null = null;
    let n = want;
    for (let d = 0; d < FRAME_COUNT && !frame; d++) {
      for (const c of [want - d, want + d]) {
        if (c >= 1 && c <= FRAME_COUNT && frames.current[c - 1]) {
          frame = frames.current[c - 1];
          n = c;
          break;
        }
      }
    }
    if (!frame || n === drawn.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // object-fit: cover, centred
    const scale = Math.max(canvas.width / frame.w, canvas.height / frame.h);
    const w = frame.w * scale;
    const h = frame.h * scale;
    ctx.drawImage(frame.source, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    drawn.current = n;
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
        drawn.current = 0; // nearest-frame choice may have changed
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
      drawn.current = 0; // resizing clears the canvas
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
      drawn.current = 0;
      schedule();
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [schedule]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  });

  const frameFor = (progress: number) =>
    Math.min(FRAME_COUNT, Math.max(1, Math.round(progress * (FRAME_COUNT - 1)) + 1));

  // Pick up the initial scroll position (e.g. page reloaded mid-hero).
  useEffect(() => {
    target.current = frameFor(scrollYProgress.get());
    schedule();
  }, [scrollYProgress, schedule]);

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const next = frameFor(progress);
    if (next !== target.current) {
      target.current = next;
      schedule();
    }
  });

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
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
