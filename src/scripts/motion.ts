// Pointer-driven effects for fine pointers only, and never under reduced motion. Elements opt in:
//   [data-spotlight]  sets --mx / --my (px) for a radial highlight that follows the cursor
//   [data-tilt]       sets --rx / --ry (deg) for a small 3D tilt
//   .magnetic         sets --tx / --ty (px) so the element leans toward the cursor
const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
