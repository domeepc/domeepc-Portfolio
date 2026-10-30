import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/boot';

const RAMP = '.,-~:;=!*#$@';
const R1 = 1;
const R2 = 2;
const K2 = 5;
const THETA_STEP = 0.05;
const PHI_STEP = 0.015;

/**
 * A spinning torus rendered with characters — a homage to Andy Sloane's donut.c.
 * The pointer tilts it, scrolling spins it faster.
 */
export default function AsciiDonut({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const styles = getComputedStyle(document.documentElement);
    const colors = [
      styles.getPropertyValue('--color-faint').trim() || '#3a3935',
      styles.getPropertyValue('--color-dim').trim() || '#8b887f',
      styles.getPropertyValue('--color-paper').trim() || '#ebe8e1',
      styles.getPropertyValue('--color-acid').trim() || '#c8ff2e',
    ];

    const thetas: [number, number][] = [];
    for (let t = 0; t < Math.PI * 2; t += THETA_STEP) thetas.push([Math.cos(t), Math.sin(t)]);
    const phis: [number, number][] = [];
    for (let p = 0; p < Math.PI * 2; p += PHI_STEP) phis.push([Math.cos(p), Math.sin(p)]);

    let cols = 0, rows = 0, cellW = 0, cellH = 0, fontSize = 12;
    let zbuf = new Float32Array(0);
    let lum = new Int8Array(0);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fontSize = width < 500 ? 10 : 12;
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
      ctx.textBaseline = 'top';
      cellW = ctx.measureText('M').width;
      cellH = fontSize * 1.2;
      cols = Math.floor(width / cellW);
      rows = Math.floor(height / cellH);
      zbuf = new Float32Array(cols * rows);
      lum = new Int8Array(cols * rows);
    };

    let A = 1, B = 0.4;
    let tiltX = 0, tiltY = 0, targetX = 0, targetY = 0, boost = 0;

    const render = () => {
      zbuf.fill(0);
      lum.fill(-1);
      const aspect = cellH / cellW;
      const K1 = (0.92 * Math.min(cols / 2, (rows * aspect) / 2) * K2) / (R1 + R2);
      const a = A + tiltY, b = B + tiltX;
      const cA = Math.cos(a), sA = Math.sin(a), cB = Math.cos(b), sB = Math.sin(b);

      for (const [ct, st] of thetas) {
        const cx = R2 + R1 * ct;
        const cy = R1 * st;
        for (const [cp, sp] of phis) {
          const x = cx * (cB * cp + sA * sB * sp) - cy * cA * sB;
          const y = cx * (sB * cp - sA * cB * sp) + cy * cA * cB;
          const ooz = 1 / (K2 + cA * cx * sp + cy * sA);
          const xp = (cols / 2 + K1 * ooz * x) | 0;
          const yp = (rows / 2 - (K1 * ooz * y) / aspect) | 0;
          if (xp < 0 || xp >= cols || yp < 0 || yp >= rows) continue;
          const L = cp * ct * sB - cA * ct * sp - sA * st + cB * (cA * st - ct * sA * sp);
          const i = xp + yp * cols;
          if (L > 0 && ooz > zbuf[i]) {
            zbuf[i] = ooz;
            lum[i] = Math.min(RAMP.length - 1, (L * 8) | 0);
          }
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Group by colour bucket to keep fillStyle switches to four per frame.
      for (let bucket = 0; bucket < 4; bucket++) {
        ctx.fillStyle = colors[bucket];
        for (let i = 0; i < lum.length; i++) {
          const l = lum[i];
          if (l < 0) continue;
          const bkt = l < 3 ? 0 : l < 7 ? 1 : l < 10 ? 2 : 3;
          if (bkt !== bucket) continue;
          ctx.fillText(RAMP[l], (i % cols) * cellW, ((i / cols) | 0) * cellH);
        }
      }
    };

    resize();
    render();

    if (prefersReducedMotion()) {
      const ro = new ResizeObserver(() => { resize(); render(); });
      ro.observe(canvas);
      return () => ro.disconnect();
    }

    let raf = 0;
    let visible = true;
    let lastScroll = window.scrollY;

    const loop = () => {
      tiltX += (targetX - tiltX) * 0.06;
      tiltY += (targetY - tiltY) * 0.06;
      boost *= 0.92;
      A += 0.012 + boost * 0.02;
      B += 0.006 + boost * 0.01;
      render();
      raf = requestAnimationFrame(loop);
    };
    const start = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(loop); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    const onPointer = (e: PointerEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 1.2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 1.2;
    };
    const onScroll = () => {
      boost = Math.min(boost + Math.abs(window.scrollY - lastScroll) / 40, 6);
      lastScroll = window.scrollY;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visible ? start() : stop();
    });
    io.observe(canvas);
    const ro = new ResizeObserver(() => { resize(); render(); });
    ro.observe(canvas);

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    start();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
