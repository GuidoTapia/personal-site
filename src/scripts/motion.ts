// Motion helpers, never active under reduced motion.
//
// 1. Scroll fallback. Chrome and Edge run the scroll effects in pure CSS (animation-timeline).
//    Elsewhere this adds .motion-fallback to <html>, marks .reveal / .section-title / .eyebrow
//    elements .is-in as they enter the viewport, and feeds --scroll-progress (header line) and
//    --rail-progress (experience timeline).
//
// 2. Pointer effects for fine pointers only. Elements opt in:
//   [data-spotlight]  sets --mx / --my (px) for a radial highlight that follows the cursor
//   [data-tilt]       sets --rx / --ry (deg) for a small 3D tilt
//   .magnetic         sets --tx / --ty (px) so the element leans toward the cursor
const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scrollTimelines = CSS.supports('animation-timeline: view()');

if (!reduced && !scrollTimelines) {
  const root = document.documentElement;
  root.classList.add('motion-fallback');

  const seen = new IntersectionObserver(
    entries =>
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        seen.unobserve(entry.target);
      }),
    { rootMargin: '0px 0px -12% 0px' },
  );
  document.querySelectorAll('.reveal, .section-title, .eyebrow').forEach(el => seen.observe(el));

  const rail = document.querySelector<HTMLElement>('.jobs');
  let queued = false;
  const update = () => {
    queued = false;
    const max = root.scrollHeight - window.innerHeight;
    root.style.setProperty('--scroll-progress', String(max > 0 ? window.scrollY / max : 0));
    if (rail) {
      // Fill the rail up to the middle of the viewport, matching the CSS range in Chrome
      const r = rail.getBoundingClientRect();
      const t = (window.innerHeight * 0.55 - r.top) / r.height;
      rail.style.setProperty('--rail-progress', String(Math.min(1, Math.max(0, t))));
    }
  };
  const onScroll = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}

if (fine && !reduced) {
  const track = (
    selector: string,
    onMove: (el: HTMLElement, x: number, y: number, r: DOMRect) => void,
    onLeave: (el: HTMLElement) => void,
  ) => {
    document.querySelectorAll<HTMLElement>(selector).forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        onMove(el, e.clientX - r.left, e.clientY - r.top, r);
      });
      el.addEventListener('pointerleave', () => onLeave(el));
    });
  };

  track(
    '[data-spotlight]',
    (el, x, y) => {
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
    },
    () => {},
  );

  track(
    '[data-tilt]',
    (el, x, y, r) => {
      el.style.setProperty('--rx', `${((0.5 - y / r.height) * 6).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${((x / r.width - 0.5) * 8).toFixed(2)}deg`);
    },
    el => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    },
  );

  track(
    '.magnetic',
    (el, x, y, r) => {
      el.style.setProperty('--tx', `${((x - r.width / 2) * 0.2).toFixed(1)}px`);
      el.style.setProperty('--ty', `${((y - r.height / 2) * 0.3).toFixed(1)}px`);
    },
    el => {
      el.style.setProperty('--tx', '0px');
      el.style.setProperty('--ty', '0px');
    },
  );
}
