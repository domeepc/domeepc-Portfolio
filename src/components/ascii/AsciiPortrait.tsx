import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/lib/boot';
import { cn } from '@/lib/utils';

const RAMP = ' .\'`^",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';
const COLS = 64;

interface Props {
  src: string;
  alt: string;
  className?: string;
}

/**
 * Converts a photo into characters. Hovering opens a lens that shows the real pixels
 * underneath; the portrait types itself in, row by row, on first view.
 */
export default function AsciiPortrait({ src, alt, className }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const styles = getComputedStyle(document.documentElement);
    const paper = styles.getPropertyValue('--color-paper').trim() || '#ebe8e1';
    const dim = styles.getPropertyValue('--color-dim').trim() || '#8b887f';
    const acid = styles.getPropertyValue('--color-acid').trim() || '#c8ff2e';

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    let chars: string[] = [];
    let shades: number[] = [];
    let rows = 0;
    let size = 0, cellW = 0, cellH = 0;
    let reveal = 0;
    let lens = { x: 0, y: 0, r: 0, target: 0 };
    let raf = 0;
    let disposed = false;

    const sample = () => {
      const probe = document.createElement('canvas');
      rows = Math.round(COLS * 0.5); // chars are ~2x taller than wide
      probe.width = COLS;
      probe.height = rows;
      const p = probe.getContext('2d', { willReadFrequently: true })!;
      p.drawImage(img, 0, 0, COLS, rows);
      const data = p.getImageData(0, 0, COLS, rows).data; // throws if CORS-tainted
      chars = [];
      shades = [];
      for (let i = 0; i < COLS * rows; i++) {
        const lumin = (0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]) / 255;
        const boosted = Math.pow(lumin, 0.85);
        chars.push(RAMP[Math.min(RAMP.length - 1, (boosted * RAMP.length) | 0)]);
        shades.push(boosted);
      }
    };

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = wrap.clientWidth;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = canvas.style.height = `${size}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cellW = size / COLS;
      cellH = size / rows;
      ctx.font = `${cellH * 0.95}px "JetBrains Mono", monospace`;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'center';
    };

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      const visibleRows = Math.floor(reveal * rows);
      for (let y = 0; y < rows; y++) {
        const typing = y === visibleRows;
        if (y > visibleRows) break;
        for (let x = 0; x < COLS; x++) {
          if (typing && x / COLS > (reveal * rows) % 1) break;
          const i = y * COLS + x;
          ctx.fillStyle = shades[i] > 0.55 ? paper : dim;
          ctx.fillText(chars[i], x * cellW + cellW / 2, y * cellH);
        }
      }
      if (lens.r > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(lens.x, lens.y, lens.r, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = '#0b0b0a';
        ctx.fillRect(0, 0, size, size);
        ctx.filter = 'grayscale(1) contrast(1.1)';
        ctx.drawImage(img, 0, 0, size, size);
        ctx.restore();
        // Dashed ASCII ring around the lens
        ctx.fillStyle = acid;
        const steps = Math.max(12, Math.round((lens.r * 2 * Math.PI) / (cellW * 1.6)));
        for (let s = 0; s < steps; s++) {
          const a = (s / steps) * Math.PI * 2 + performance.now() / 1600;
          ctx.fillText(s % 2 ? '·' : '+', lens.x + Math.cos(a) * (lens.r + 6), lens.y + Math.sin(a) * (lens.r + 6) - cellH / 2);
        }
      }
    };

    const animate = () => {
      lens.r += (lens.target - lens.r) * 0.18;
      draw();
      const settled = Math.abs(lens.target - lens.r) < 0.5 && reveal >= 1;
      raf = settled && lens.target === 0 ? 0 : requestAnimationFrame(animate);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(animate); };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      lens.x = e.clientX - rect.left;
      lens.y = e.clientY - rect.top;
      lens.target = size * 0.2;
      kick();
    };
    const onLeave = () => { lens.target = 0; kick(); };

    const startReveal = () => {
      if (prefersReducedMotion()) {
        reveal = 1;
        draw();
        return;
      }
      const t0 = performance.now();
      const step = (now: number) => {
        if (disposed) return;
        reveal = Math.min((now - t0) / 1400, 1);
        draw();
        if (reveal < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    let io: IntersectionObserver | undefined;
    const ro = new ResizeObserver(() => { if (chars.length) { layout(); draw(); } });

    img.onload = () => {
      if (disposed) return;
      try {
        sample();
      } catch {
        setFailed(true);
        return;
      }
      layout();
      ro.observe(wrap);
      io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          io?.disconnect();
          startReveal();
        }
      }, { threshold: 0.3 });
      io.observe(wrap);
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerdown', onMove);
      canvas.addEventListener('pointerleave', onLeave);
    };
    img.onerror = () => setFailed(true);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io?.disconnect();
      ro.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [src]);

  return (
    <div ref={wrapRef} className={cn('relative aspect-square w-full', className)}>
      {failed ? (
        <img src={src} alt={alt} className="h-full w-full object-cover grayscale contrast-125" />
      ) : (
        <canvas ref={canvasRef} role="img" aria-label={alt} className="block" />
      )}
    </div>
  );
}
