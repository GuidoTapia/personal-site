// Understand lens: a circle that follows the cursor and shows the page as its own blueprint.
//
// On first use it deep-clones <main> and the footer into an inert, aria-hidden overlay placed at the
// same document coordinates, so the copy lines up with the real page. The overlay is clipped to a
// circle around the pointer. In the copy, islands, images, and videos become sized boxes: an
// <astro-island> must never reach the live DOM, or Astro would hydrate it a second time. Cloning
// happens in a detached document for the same reason. Styles live in src/styles/lens.css.
import '@/styles/lens.css';

const btn = document.querySelector<HTMLButtonElement>('[data-lens-toggle]');
const main = document.querySelector<HTMLElement>('main');

if (btn && main) {
  const root = document.documentElement;
  const label = btn.querySelector('.lens-toggle__label')?.textContent?.trim() ?? '';
  let layer: HTMLDivElement | null = null;
  let rim: HTMLDivElement | null = null;
  let rimName: HTMLElement | null = null;
  let stale = false;
  let on = false;
  let touch = false;
  let lastType = 'mouse';
  let x = 0;
  let y = 0;
  let r = 150;
  let left = 0;
  let top = 0;
  let frame = 0;
  let timer = 0;
  let drag: { id: number; dx: number; dy: number } | null = null;

  const round = (n: number) => Math.round(n);
  const size = (rect: DOMRect) => `${round(rect.width)} × ${round(rect.height)}`;

  // A sized stand-in for content that can't (or shouldn't) be cloned
  const box = (src: Element, kind: string, name: string, note = '') => {
    const target = src.tagName === 'ASTRO-ISLAND' ? (src.firstElementChild ?? src) : src;
    const rect = target.getBoundingClientRect();
    const cs = getComputedStyle(target);
    const el = document.createElement('div');
    el.className = `bp__box bp__box--${kind}`;
    el.style.cssText = `display:${cs.display === 'inline' ? 'inline-block' : 'block'};width:${rect.width}px;height:${rect.height}px;margin:${cs.margin}`;
    el.dataset.name = name;
    el.dataset.note = note ? `${note}\n${size(rect)}` : size(rect);
    return el;
  };

  const build = () => {
    stale = false;
    const footer = document.querySelector<HTMLElement>('body > footer');
    const sources = footer ? [main, footer] : [main];
    const base = main.getBoundingClientRect();
    left = base.left + scrollX;
    top = base.top + scrollY;
    const scratch = document.implementation.createHTMLDocument('');
    const pages: Node[] = [];
    // Labels go in their own layer, positioned from the real elements
    const tags = document.createElement('div');
    tags.className = 'bp__tags';
    const placed: [number, number][] = [];
    const tag = (text: string, px: number, py: number, extra: string, cls = '') => {
      while (placed.some(([a, b]) => Math.abs(a - px) < 220 && Math.abs(b - py) < 22)) py += 22;
      placed.push([px, py]);
      const t = document.createElement('span');
      t.className = `bp__tag${cls}`;
      t.style.cssText = `left:${px}px;top:${py}px`;
      t.textContent = text;
      const s = document.createElement('small');
      s.textContent = extra;
      t.append(s);
      tags.append(t);
    };

    for (const src of sources) {
      const copy = scratch.importNode(src, true) as HTMLElement;
      const from = src.querySelectorAll('*');
      const to = copy.querySelectorAll('*');
      copy.removeAttribute('id');
      copy.classList.add('bp__page');
      from.forEach((s, i) => {
        const d = to[i];
        d.removeAttribute('id');
        const el = s.tagName;
        if (el === 'ASTRO-ISLAND') {
          const host = s.closest<HTMLElement>('[data-bp-island]');
          const name =
            host?.dataset.bpIsland ?? `${s.getAttribute('component-export') ?? 'React'} island`;
          d.replaceWith(box(s, 'island', name, host?.dataset.bpNote));
        } else if (el === 'IMG' || el === 'VIDEO' || el === 'CANVAS') {
          d.replaceWith(box(s, 'img', el.toLowerCase()));
        } else if (el === 'SCRIPT' || el === 'TEMPLATE' || el === 'NOSCRIPT') {
          d.remove();
        } else {
          // Make flex and grid gaps visible
          const cs = getComputedStyle(s);
          const gap = parseFloat(cs.columnGap) || parseFloat(cs.rowGap);
          if (/flex|grid/.test(cs.display) && gap > 0 && s.childElementCount > 1) {
            d.classList.add('bp-gap');
            const rect = s.getBoundingClientRect();
            if (rect.width > 240) {
              const grid = cs.display.includes('grid');
              const cols = cs.gridTemplateColumns.split(' ').length;
              tag(
                grid ? `grid · ${cols} col` : 'flex',
                rect.right - base.left,
                rect.top - base.top,
                `gap ${round(gap)}`,
                ' bp__tag--layout',
              );
            }
          }
        }
      });
      pages.push(document.adoptNode(copy));
    }

    for (const src of sources) {
      const all = [src, ...src.querySelectorAll<HTMLElement>('[data-bp]')].filter(
        e => e.dataset.bp,
      );
      all.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width) tag(el.dataset.bp!, rect.left - base.left, rect.top - base.top, size(rect));
      });
    }

    const el = layer ?? document.createElement('div');
    el.className = 'bp';
    el.setAttribute('aria-hidden', 'true');
    el.inert = true;
    el.style.cssText = `top:${top}px;left:${left}px;width:${base.width}px`;
    el.replaceChildren(...pages, tags);
    if (!layer) document.body.append(el);
    layer = el;
  };

  const paint = () => {
    frame = 0;
    if (!layer || !rim) return;
    layer.style.clipPath = `circle(${r}px at ${x + scrollX - left}px ${y + scrollY - top}px)`;
    rim.style.transform = `translate3d(${x - r}px, ${y - r}px, 0)`;
    const hit = document
      .elementsFromPoint(x, y)
      .find(e => !rim!.contains(e))
      ?.closest<HTMLElement>('[data-bp]');
    rimName!.textContent = hit
      ? `${label} · ${hit.dataset.bp!.split(' · ')[0].split('/').slice(-2).join('/')}`
      : label;
  };
  const queue = () => {
    if (on && !frame) frame = requestAnimationFrame(paint);
  };

  const makeRim = () => {
    rim = document.createElement('div');
    rim.className = 'bp-rim';
    rim.setAttribute('aria-hidden', 'true');
    rim.innerHTML =
      '<i class="bp-rim__scan"></i><b class="bp-rim__name"></b><span class="bp-rim__hint"></span>';
    rimName = rim.querySelector('b');
    rim.querySelector('span')!.textContent = btn.dataset.drag ?? '';
    // Touch: drag the lens itself, so the rest of the page still scrolls normally
    rim.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse') return;
      drag = { id: e.pointerId, dx: e.clientX - x, dy: e.clientY - y };
      rim!.setPointerCapture(e.pointerId);
    });
    rim.addEventListener('pointermove', e => {
      if (drag?.id !== e.pointerId) return;
      x = e.clientX - drag.dx;
      y = e.clientY - drag.dy;
      queue();
    });
    const end = () => (drag = null);
    rim.addEventListener('pointerup', end);
    rim.addEventListener('pointercancel', end);
    document.body.append(rim);
  };

  const set = (next: boolean) => {
    on = next;
    btn.setAttribute('aria-pressed', String(on));
    if (!on) {
      delete root.dataset.lens;
      root.removeAttribute('data-lens-touch');
      return;
    }
    if (!layer || stale) build();
    if (!rim) makeRim();
    touch = lastType !== 'mouse';
    r = Math.min(150, round(innerWidth * 0.34));
    root.style.setProperty('--lens-r', `${r}px`);
    root.toggleAttribute('data-lens-touch', touch);
    root.dataset.lens = 'on';
    if (touch || !x) {
      x = innerWidth / 2;
      y = innerHeight / 2;
    }
    queue();
  };

  btn.hidden = false;
  btn.addEventListener('click', () => set(!on));

  addEventListener('pointerdown', e => (lastType = e.pointerType), {
    capture: true,
    passive: true,
  });
  addEventListener(
    'pointermove',
    e => {
      if (e.pointerType === 'touch') return;
      lastType = e.pointerType;
      x = e.clientX;
      y = e.clientY;
      if (on) root.dataset.lens = 'on';
      queue();
    },
    { passive: true },
  );
  document.addEventListener('pointerout', e => {
    if (on && !e.relatedTarget && e.pointerType === 'mouse') root.dataset.lens = 'away';
  });
  addEventListener('scroll', queue, { passive: true });

  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
    const t = e.target as HTMLElement;
    if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    if (e.key === 'Escape' && on) set(false);
    else if (e.key === 'u' || e.key === 'U') {
      lastType = 'mouse';
      set(!on);
    }
  });

  // Layout changed: rebuild now if the lens is on, otherwise on next use
  new ResizeObserver(() => {
    if (!layer) return;
    stale = true;
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (on) {
        build();
        set(true);
      }
    }, 200);
  }).observe(main);
}
