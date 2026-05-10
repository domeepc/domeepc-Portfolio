/**
 * Smoothly scrolls to a target Y position using an ease-out-expo curve.
 * Duration scales with distance so short jumps feel snappy and long jumps feel cinematic.
 */
export function smoothScrollTo(targetY: number) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  if (Math.abs(distance) < 1) return;

  // Scale duration: 400ms minimum, up to 900ms for very long distances.
  const duration = Math.min(900, Math.max(400, Math.abs(distance) * 0.4));
  const startTime = performance.now();

  function easeOutExpo(t: number): number {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function step(now: number) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + distance * easeOutExpo(t));
    if (t < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

/**
 * Resolves an anchor href like "#skills" to the element's offsetTop,
 * accounting for the fixed navbar height.
 */
export function scrollToHash(hash: string) {
  const id = hash.replace("#", "");
  const el = document.getElementById(id);
  if (!el) return;
  const navbarHeight = 72; // matches py-4 + content height
  const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
  smoothScrollTo(top);
}
