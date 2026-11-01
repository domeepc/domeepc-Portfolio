import { useEffect } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { onBooted, prefersReducedMotion } from '@/lib/boot';

gsap.registerPlugin(ScrollTrigger);

const EASE = 'expo.out';

/**
 * Scroll choreography for one island, declared in its markup:
 *   data-hero          → staggered into the hero intro after boot
 *   data-hero-content  → drifts up and dims as the hero scrolls away
 *   data-split         → words of a <SplitWords> rise out of their masks
 *   data-reveal        → fades up, batched with neighbours entering together
 *   data-draw          → scales in from the left ("y" = from the top)
 *   .marquee           → CSS marquee only runs while on screen
 * Runs from the island's own effect, i.e. after hydration: touching an island's DOM
 * before React hydrates it causes attribute mismatches. Server HTML stays fully visible.
 */
export function useReveal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const q = gsap.utils.selector(root);
    let hero: HTMLElement[] = [];

    const ctx = gsap.context(() => {
      hero = q('[data-hero]');
      if (hero.length) {
        // CSS hides these pre-JS via html.motion-pending; take over from it.
        gsap.set(hero, { opacity: 0, y: 16 });
        document.documentElement.classList.remove('motion-pending');
      }

      q('[data-hero-content]').forEach((el) =>
        gsap.to(el, {
          yPercent: -14,
          opacity: 0.25,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
        }),
      );

      q('[data-split]').forEach((el) =>
        gsap.from(el.querySelectorAll('.split-inner'), {
          yPercent: 110,
          duration: 1,
          ease: EASE,
          stagger: 0.06,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }),
      );

      q('[data-draw]').forEach((el) => {
        const vertical = el.dataset.draw === 'y';
        gsap.from(el, {
          [vertical ? 'scaleY' : 'scaleX']: 0,
          transformOrigin: vertical ? 'top' : 'left',
          duration: 1.2,
          ease: 'power4.inOut',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      });

      q('.marquee').forEach((el) => ScrollTrigger.create({ trigger: el, toggleClass: 'is-onscreen' }));

      // Anything already scrolled past (deep link, refresh mid-page) just stays visible.
      const pending = q('[data-reveal]').filter((el) => el.getBoundingClientRect().bottom > 0);
      if (!pending.length) return;
      gsap.set(pending, { opacity: 0, y: 24 });
      ScrollTrigger.batch(pending, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: EASE, stagger: 0.08, delay: 0.15 }),
      });
    }, root);

    // Subscribed after ctx exists: onBooted fires synchronously when already booted.
    // Message and CTAs land within ~0.8s so the page is usable almost immediately.
    const offBoot = hero.length
      ? onBooted(() =>
          ctx.add(() => gsap.to(hero, { opacity: 1, y: 0, duration: 0.8, ease: EASE, stagger: 0.09, delay: 0.1 })),
        )
      : () => {};

    return () => {
      offBoot();
      ctx.revert();
    };
  }, [ref]);
}
