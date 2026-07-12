# Framer Motion → GSAP Migration

## Goal
Replace `framer-motion` with `gsap` + `@gsap/react` across the portfolio. Full swap in one pass; `framer-motion` removed from `package.json` at the end.

## Current framer-motion usage (9 files)

| File | Usage |
|---|---|
| `src/hooks/useScrollAnimation.ts` | `useInView` (once, threshold) — used by About/Skills/Timeline/Projects/Contact for fade+translate on scroll entry |
| `src/components/About.tsx` | `motion.div` fade+translate, driven by `useScrollAnimation` |
| `src/components/Skills.tsx` | same pattern |
| `src/components/Projects.tsx` | same pattern |
| `src/components/Contact.tsx` | same pattern |
| `src/components/Timeline.tsx` | fade+translate on header (via `useScrollAnimation`) **plus** scroll-scrubbed line height and per-item scale/opacity/y via `useScroll`/`useTransform`/`useSpring` |
| `src/components/Hero.tsx` | mount-only fade/translate sequence, no scroll |
| `src/components/Navbar.tsx` | mount fade for nav bar; `AnimatePresence` exit animation for mobile fullscreen menu overlay |
| `src/components/CustomCursor.tsx` | `useMotionValue`/`useSpring` — cursor dot (instant) + ring (spring-lagged) position, scale, opacity on mousemove/hover |

## Approach per component

**Dependencies:** add `gsap`, `@gsap/react`. Remove `framer-motion` once all files are converted.

1. **`useScrollAnimation.ts`** — replaced by a small GSAP-based hook (or inlined `useGSAP` + `ScrollTrigger` per component) using `ScrollTrigger` with `once: true`-equivalent (`toggleActions: "play none none none"`), matching current one-shot scroll-entry behavior.

2. **About / Skills / Projects / Contact** — `gsap.from()` tweens (opacity + y/x offset matching current values) inside `useGSAP`, triggered by `ScrollTrigger` on the section ref. Same durations/offsets as current framer values, eased with `power2.out` (closest match to Framer's default ease).

3. **Timeline.tsx** — two parts:
   - Header fade+translate: same pattern as #2.
   - Scroll-scrubbed line height + per-item scale/opacity/y: `ScrollTrigger` with `scrub: true` bound to the timeline container, animating a CSS custom property / element style for line height and each item's transform, replacing `useTransform(scrollYProgress, ...)`.

4. **Hero.tsx** — `gsap.timeline()` inside `useGSAP` on mount, sequencing the same fade/translate steps with matching delays.

5. **Navbar.tsx**:
   - Nav bar mount fade: `gsap.from()` on mount.
   - Mobile menu: overlay stays mounted in the DOM at all times (not conditionally rendered). `menuOpen` state drives a `gsap.to()` toggling opacity/scale and `pointer-events`/`visibility` so it's inert and hidden when closed. Replaces `AnimatePresence` conditional mount/unmount.

6. **CustomCursor.tsx** — `gsap.quickTo()` per animated property (dot x/y; ring x/y/scale/opacity) for performant continuous mousemove updates. Ring "lag" and hover scale/opacity approximated with `power3.out`-style duration/ease tuning rather than literal spring stiffness/damping (GSAP has no direct spring-physics equivalent to Framer's `useSpring`).

## Fidelity note
GSAP eases (`power2.out`, `power3.out`, etc.) approximate Framer's default spring/tween curves closely but not bit-for-bit identically. Acceptable — visual feel is the bar, not exact curve match.

## Out of scope
- No new animations or behavior changes beyond the library swap.
- No changes to animation timing/values unless required by the library switch (e.g., spring → eased duration).
