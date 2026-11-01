import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { prefersReducedMotion, randomGlyph } from '@/lib/boot';

/**
 * Decodes `text` from random glyphs into `ref`, left to right. Call `play()` to (re)run it.
 * Writes to the DOM directly so a running scramble never re-renders React.
 * Spaces are preserved so the word shape stays readable while it resolves.
 */
export function useScramble(text: string, ref: RefObject<HTMLElement | null>, { duration = 600 } = {}) {
  const frame = useRef(0);

  const play = useCallback(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    cancelAnimationFrame(frame.current);
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const revealed = Math.floor(t * text.length);
      let next = '';
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        next += i < revealed || ch === ' ' ? ch : randomGlyph();
      }
      el.textContent = next;
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }, [text, duration, ref]);

  useEffect(() => {
    if (ref.current) ref.current.textContent = text;
    return () => cancelAnimationFrame(frame.current);
  }, [text, ref]);

  return play;
}
