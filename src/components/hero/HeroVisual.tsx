import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import './HeroVisual.css';

// The WebGL scene (three.js + R3F) is a separate chunk, downloaded only when the device can run it.
const HeroScene = lazy(() => import('./HeroScene'));

interface Props {
  poster: string; // portrait used by the CSS fallback
  sample: string; // small portrait the particle scene samples brightness from
  labels: { audit: string; build: string; description: string };
}

const DEFAULT_SPLIT = 0.55;

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

// Skip WebGL on reduced motion, data saver, low-end hardware, or when WebGL2 is unavailable.
// Those visitors keep the CSS version, which shows the same idea.
function canRunScene(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const nav = navigator as NavigatorHints;
  if (nav.connection?.saveData) return false;
  if ((nav.hardwareConcurrency ?? 4) < 4) return false;
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return false;
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export default function HeroVisual({ poster, sample, labels }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  // Current split position (0 = all build, 1 = all audit), shared with the scene without re-renders.
  const splitRef = useRef(DEFAULT_SPLIT);
  const [sceneEnabled, setSceneEnabled] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    // Capability checks need the browser, so they run after hydration rather than during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (canRunScene()) setSceneEnabled(true);
  }, []);

  // Pointer (or, with no pointer, a slow idle sweep) drives the split for both the CSS and WebGL versions.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.style.setProperty('--split', String(DEFAULT_SPLIT));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const area = root.closest<HTMLElement>('[data-hero]') ?? root;
    let target: number | null = null;
    let lastMove = -Infinity;
    let frame = 0;
    let running = false;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const r = root.getBoundingClientRect();
      target = clamp((e.clientX - r.left) / r.width, 0.12, 0.88);
      lastMove = performance.now();
    };
    const onLeave = () => (target = null);

    const tick = (now: number) => {
      const idle = target === null || now - lastMove > 3000;
      const goal = idle ? 0.5 + 0.17 * Math.sin(now / 1600) : (target as number);
      const next = splitRef.current + (goal - splitRef.current) * (idle ? 0.03 : 0.09);
      if (Math.abs(next - splitRef.current) > 0.0003) {
        splitRef.current = next;
        root.style.setProperty('--split', next.toFixed(4));
      }
      if (running) frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting;
      setInView(visible);
      if (visible && !running) {
        running = true;
        frame = requestAnimationFrame(tick);
      } else if (!visible) {
        running = false;
        cancelAnimationFrame(frame);
      }
    });

    area.addEventListener('pointermove', onMove);
    area.addEventListener('pointerleave', onLeave);
    observer.observe(root);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      area.removeEventListener('pointermove', onMove);
      area.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`hv${sceneReady ? ' is-live' : ''}`}
      role="img"
      aria-label={labels.description}>
      <div className="hv__poster" aria-hidden="true">
        <div className="hv__build">
          <img src={poster} alt="" width={760} height={760} />
        </div>
        <div className="hv__audit">
          <img src={poster} alt="" width={760} height={760} />
          <span className="hv__scan" />
        </div>
      </div>

      {sceneEnabled && (
        <Suspense fallback={null}>
          <HeroScene
            sample={sample}
            splitRef={splitRef}
            active={inView}
            onReady={() => setSceneReady(true)}
          />
        </Suspense>
      )}

      <span className="hv__line" aria-hidden="true" />
      <span className="hv__label hv__label--audit" aria-hidden="true">
        {labels.audit}
      </span>
      <span className="hv__label hv__label--build" aria-hidden="true">
        {labels.build}
      </span>
    </div>
  );
}
