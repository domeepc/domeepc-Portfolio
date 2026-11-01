import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { isBooted, prefersReducedMotion } from '@/lib/boot';
import { setLenis } from '@/lib/smoothScroll';

gsap.registerPlugin(ScrollTrigger);

/**
 * Page-wide scroll engine: Lenis smooth scroll driven by GSAP's ticker and wired into
 * ScrollTrigger. Per-section animation lives in each island (see useReveal).
 */
export default function Motion() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ autoRaf: false });
    const raf = (time: number) => lenis.raf(time * 1000);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    setLenis(lenis);
    if (!isBooted()) lenis.stop(); // the preloader restarts it via lockScroll(false)

    // Islands hydrate and images/fonts load after first measure: re-measure when layout settles.
    let refreshTimer = 0;
    const refresh = () => {
      clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    };
    const ro = new ResizeObserver(refresh);
    ro.observe(document.body);
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);

    return () => {
      ro.disconnect();
      clearTimeout(refreshTimer);
      window.removeEventListener('load', refresh);
      gsap.ticker.remove(raf);
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
