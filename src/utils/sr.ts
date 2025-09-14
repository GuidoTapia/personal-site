import { srConfig } from '@config';

// Check if we're in the browser
const isBrowser = typeof window !== 'undefined';

// Default options
const defaultOptions = {
  origin: 'bottom',
  distance: '20px',
  duration: 500,
  delay: 200,
  rotate: { x: 0, y: 0, z: 0 },
  opacity: 0,
  scale: 1,
  easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  mobile: true,
  reset: false,
  useDelay: 'always',
  viewFactor: 0.25,
  viewOffset: { top: 0, right: 0, bottom: 0, left: 0 },
};

// ScrollReveal instance
let sr: any = null;

// Initialize ScrollReveal
const initScrollReveal = async () => {
  if (!isBrowser) return;

  try {
    const ScrollReveal = (await import('scrollreveal')).default;
    sr = ScrollReveal();
  } catch (error) {
    console.warn('ScrollReveal not available:', error);
  }
};

// Reveal function
const reveal = (element: HTMLElement | null, options = {}) => {
  if (!isBrowser || !sr || !element) return;

  const config = { ...defaultOptions, ...options };
  sr.reveal(element, config);
};

// Initialize on load
if (isBrowser) {
  initScrollReveal();
}

export default { reveal };
