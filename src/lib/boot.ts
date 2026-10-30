export const GLYPHS = '!<>-_\\/[]{}=+*^?#%&@$01';
export const BLOCKS = ' ░▒▓█';

export function randomGlyph(set = GLYPHS) {
  return set[(Math.random() * set.length) | 0];
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** True once the preloader finished (or was skipped). */
export function isBooted() {
  return typeof document !== 'undefined' && document.documentElement.dataset.booted === '1';
}

export function markBooted() {
  document.documentElement.dataset.booted = '1';
  try { sessionStorage.setItem('booted', '1'); } catch { /* storage unavailable */ }
  window.dispatchEvent(new Event('boot:done'));
}

/** Runs `cb` as soon as the boot sequence is done. Returns an unsubscribe. */
export function onBooted(cb: () => void) {
  if (isBooted()) {
    cb();
    return () => {};
  }
  window.addEventListener('boot:done', cb, { once: true });
  return () => window.removeEventListener('boot:done', cb);
}
