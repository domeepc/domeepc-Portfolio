import { useCallback, useEffect, useRef, useState } from 'react';
import { prefersReducedMotion, randomGlyph } from '@/lib/boot';

/**
 * Decodes `text` from random glyphs, left to right. Call `play()` to (re)run it.
 * Spaces are preserved so the word shape stays readable while it resolves.
 */
export function useScramble(text: string, { duration = 600, autoplay = false } = {}) {
  const [output, setOutput] = useState(text);
  const frame = useRef(0);

  const play = useCallback(() => {
    if (prefersReducedMotion()) return;
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
      setOutput(next);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }, [text, duration]);

  useEffect(() => {
    setOutput(text);
    if (autoplay) play();
    return () => cancelAnimationFrame(frame.current);
  }, [text, autoplay, play]);

  return { output, play };
}
