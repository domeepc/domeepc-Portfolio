import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { BLOCKS, onBooted, prefersReducedMotion } from '@/lib/boot';
import { cn } from '@/lib/utils';

interface Props {
  art: string;
  label: string;
  className?: string;
  duration?: number;
  delay?: number;
}

/**
 * Renders FIGlet art that materialises column by column: each glyph passes through
 * ░ ▒ ▓ before settling, with a little per-cell jitter so the edge looks scanned in.
 */
export default function AsciiReveal({ art, label, className, duration = 1100, delay = 0 }: Props) {
  const ref = useRef<HTMLPreElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [frame, setFrame] = useState(() => art.replace(/[^\n]/g, ' '));

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) {
      setFrame(art);
      return;
    }
    let raf = 0;
    let timer = 0;
    const lines = art.split('\n');
    const width = Math.max(...lines.map((l) => l.length));
    const jitter = lines.map((l) => Array.from(l, () => Math.random() * 0.18));

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1) * 1.25;
        const out = lines
          .map((line, y) =>
            Array.from(line, (ch, x) => {
              if (ch === ' ') return ch;
              const local = (t - x / width - jitter[y][x]) * 6;
              if (local >= 1) return ch;
              if (local <= 0) return ' ';
              return BLOCKS[1 + Math.floor(local * 3)];
            }).join(''),
          )
          .join('\n');
        setFrame(out);
        if (t < 1.25) raf = requestAnimationFrame(tick);
        else setFrame(art);
      };
      raf = requestAnimationFrame(tick);
    };

    const off = onBooted(() => { timer = window.setTimeout(run, delay); });
    return () => {
      off();
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [inView, art, duration, delay]);

  return (
    <pre ref={ref} role="img" aria-label={label} className={cn('ascii-pre', className)}>
      {frame}
    </pre>
  );
}
