import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { canRunScene } from '@/components/hero/capability';
import type { Building } from '@/lib/codeCity';

// three.js + R3F load only when the device passes the same gate as the hero (and share its chunk).
const StoryScene = lazy(() => import('./StoryScene'));

interface Props {
  sample: string;
  buildings: Building[];
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export default function StoryVisual({ sample, buildings }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [enabled, setEnabled] = useState(false);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (canRunScene()) setEnabled(true);
  }, []);

  // Scroll position → chapter progress. Each chapter counts as reached while its top travels
  // from 75% to 35% of the viewport, so the shape settles as its text arrives. On phones the
  // stage pins over the top half, so chapters trigger lower, while their text is below it.
  useEffect(() => {
    const root = rootRef.current;
    const section = root?.closest<HTMLElement>('[data-story]');
    if (!root || !section) return;
    const steps = [...section.querySelectorAll<HTMLElement>('[data-step]')];

    let queued = false;
    const update = () => {
      queued = false;
      const vh = window.innerHeight;
      const [start, end] = window.innerWidth <= 760 ? [0.98, 0.62] : [0.75, 0.35];
      let p = 0;
      for (const step of steps) {
        const top = step.getBoundingClientRect().top;
        p += clamp01((vh * start - top) / (vh * (start - end)));
      }
      progressRef.current = p;
      section.dataset.at = String(Math.min(steps.length, Math.round(p)));
    };
    const onScroll = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: '20% 0px',
    });
    observer.observe(section);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div ref={rootRef} className={`story-visual${ready ? ' is-live' : ''}`}>
      {enabled && (
        <Suspense fallback={null}>
          <StoryScene
            sample={sample}
            buildings={buildings}
            progressRef={progressRef}
            active={inView}
            onReady={() => setReady(true)}
          />
        </Suspense>
      )}
    </div>
  );
}
