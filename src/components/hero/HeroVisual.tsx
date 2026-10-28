import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { canRunScene } from './capability';
import { createGrab } from './grab';
import './HeroVisual.css';

// The WebGL scene (three.js + R3F) is a separate chunk, downloaded only when the device can run it.
const HeroScene = lazy(() => import('./HeroScene'));

interface Props {
  poster: string; // portrait used by the CSS fallback
  sample: string; // small portrait the particle scene samples brightness from
  labels: { understand: string; build: string; description: string; stretch: string; poke: string };
}

const DEFAULT_SPLIT = 0.55;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export default function HeroVisual({ poster, sample, labels }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  // Current split position (0 = all build, 1 = all understand), shared with the scene without re-renders.
  const splitRef = useRef(DEFAULT_SPLIT);
  const grabRef = useRef(createGrab());
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

    // Fade out the label of a side that is too narrow to hold it, so labels never clip or collide.
    const [leftLabel, rightLabel] = root.querySelectorAll<HTMLElement>('.hv__label');
    let sizes = { box: 0, left: 0, right: 0 };
    const measure = () => {
      sizes = { box: root.clientWidth, left: leftLabel.offsetWidth, right: rightLabel.offsetWidth };
    };
    const apply = (split: number) => {
      root.style.setProperty('--split', split.toFixed(4));
      root.toggleAttribute('data-hide-left', split * sizes.box < sizes.left + 24);
      root.toggleAttribute('data-hide-right', (1 - split) * sizes.box < sizes.right + 24);
    };
    const resize = new ResizeObserver(() => {
      measure();
      apply(splitRef.current);
    });
    resize.observe(root);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return () => resize.disconnect();
    }

    const area = root.closest<HTMLElement>('[data-hero]') ?? root;
    let target: number | null = null;
    let lastMove = -Infinity;
    let frame = 0;
    let running = false;

    const onMove = (e: PointerEvent) => {
      // Hold the split still while the face is being stretched.
      if (e.pointerType === 'touch' || grabRef.current.down) return;
      const r = root.getBoundingClientRect();
      target = clamp((e.clientX - r.left) / r.width, 0.12, 0.88);
      lastMove = performance.now();
    };
    const onLeave = () => (target = null);

    // Grab and stretch the face (mouse, pen), or poke it (touch, so the page still scrolls).
    // Only the WebGL scene reacts; the handlers are cheap no-ops for the CSS poster.
    const local = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      return [e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2];
    };
    const grab = grabRef.current;
    const onDown = (e: PointerEvent) => {
      if (!root.classList.contains('is-live') || e.button !== 0) return;
      const [x, y] = local(e);
      if (e.pointerType === 'touch') {
        grab.poke += 1;
        grab.pokeX = x;
        grab.pokeY = y;
      } else {
        e.preventDefault();
        root.setPointerCapture(e.pointerId);
        Object.assign(grab, { down: true, startX: x, startY: y, x, y });
        root.toggleAttribute('data-grabbing', true);
      }
      root.toggleAttribute('data-touched', true);
    };
    const onDrag = (e: PointerEvent) => {
      if (!grab.down) return;
      [grab.x, grab.y] = local(e);
    };
    const onUp = () => {
      grab.down = false;
      root.toggleAttribute('data-grabbing', false);
    };

    const tick = (now: number) => {
      const idle = target === null || now - lastMove > 3000;
      const goal = idle ? 0.5 + 0.17 * Math.sin(now / 1600) : (target as number);
      const next = splitRef.current + (goal - splitRef.current) * (idle ? 0.03 : 0.09);
      if (Math.abs(next - splitRef.current) > 0.0003) {
        splitRef.current = next;
        apply(next);
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
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointermove', onDrag);
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointercancel', onUp);
    observer.observe(root);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      area.removeEventListener('pointermove', onMove);
      area.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointermove', onDrag);
      root.removeEventListener('pointerup', onUp);
      root.removeEventListener('pointercancel', onUp);
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
            grabRef={grabRef}
            active={inView}
            onReady={() => setSceneReady(true)}
          />
        </Suspense>
      )}

      <span className="hv__line" aria-hidden="true" />
      <span className="hv__label hv__label--audit" aria-hidden="true">
        {labels.understand}
      </span>
      <span className="hv__label hv__label--build" aria-hidden="true">
        {labels.build}
      </span>
      {sceneReady && (
        <span className="hv__hint" aria-hidden="true">
          <span className="hv__hint--fine">{labels.stretch}</span>
          <span className="hv__hint--touch">{labels.poke}</span>
        </span>
      )}
    </div>
  );
}
