type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

// Skip WebGL on reduced motion, data saver, low-end hardware, or when WebGL2 is unavailable.
// Those visitors keep the CSS version, which shows the same idea.
export function canRunScene(): boolean {
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
