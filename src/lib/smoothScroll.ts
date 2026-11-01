import type Lenis from 'lenis';
import { prefersReducedMotion } from './boot';

const NAVBAR_HEIGHT = 72;

/** The page's single Lenis instance, set by the Motion island (null under reduced motion). */
let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

/** Locks or unlocks page scrolling (preloader, mobile menu). */
export function lockScroll(locked: boolean) {
  document.body.style.overflow = locked ? 'hidden' : '';
  if (locked) lenis?.stop();
  else lenis?.start();
}

export function smoothScrollTo(targetY: number) {
  if (lenis) return lenis.scrollTo(targetY, { duration: 1.2, force: true });
  window.scrollTo({ top: targetY, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

/** Scrolls to an anchor like "#skills", clearing the fixed navbar, then moves focus there. */
export function scrollToHash(hash: string) {
  const el = document.getElementById(hash.replace('#', ''));
  if (!el) return;
  smoothScrollTo(el.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT);
  history.replaceState(null, '', hash);
  el.focus({ preventScroll: true });
}
