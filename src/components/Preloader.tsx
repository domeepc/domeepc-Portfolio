import { useEffect, useState } from 'react';
import { isBooted, markBooted } from '@/lib/boot';

const LOG = [
  'BIOS v2.6 — domeepc systems',
  'mounting /dev/portfolio ........ ok',
  'loading kernel: astro + react .. ok',
  'linking embedded/c++ modules ... ok',
  'calibrating donut.c ............ ok',
  'rendering 0x7f glyph table ..... ok',
];
const BAR = 24;
const DURATION = 1700;

/** One-per-session terminal boot sequence that wipes away in horizontal bands. */
export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (isBooted()) {
      setGone(true);
      return;
    }
    document.body.style.overflow = 'hidden';
    let raf = 0;
    let timer = 0;
    const t0 = performance.now();
    const finish = () => {
      cancelAnimationFrame(raf);
      setProgress(1);
      setLeaving(true);
      document.body.style.overflow = '';
      markBooted();
      timer = window.setTimeout(() => setGone(true), 900);
    };
    const tick = (now: number) => {
      const t = Math.min((now - t0) / DURATION, 1);
      // Stuttered progress reads more "real" than a smooth ramp.
      setProgress(Math.floor(t * 20) / 20 + (t === 1 ? 0 : Math.random() * 0.03));
      if (t < 1) raf = requestAnimationFrame(tick);
      else timer = window.setTimeout(finish, 250);
    };
    raf = requestAnimationFrame(tick);
    const skip = () => finish();
    window.addEventListener('keydown', skip, { once: true });
    window.addEventListener('pointerdown', skip, { once: true });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
      document.body.style.overflow = '';
    };
  }, []);

  if (gone) return null;

  const p = Math.min(progress, 1);
  const filled = Math.round(p * BAR);
  const lines = LOG.slice(0, Math.ceil(p * LOG.length));

  return (
    <div
      role="status"
      aria-label="Loading portfolio"
      className="preloader fixed inset-0 z-[90] flex flex-col"
    >
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="flex-1 bg-ink transition-transform duration-700 ease-[cubic-bezier(.7,0,.2,1)]"
          style={{
            transform: leaving ? `translateX(${i % 2 ? '' : '-'}101%)` : 'none',
            transitionDelay: `${i * 40}ms`,
          }}
        />
      ))}
      <div
        className={`absolute inset-0 flex flex-col justify-end p-6 text-xs text-dim md:p-10 md:text-sm transition-opacity duration-200 ${leaving ? 'opacity-0' : ''}`}
      >
        {lines.map((l) => (
          <p key={l}>
            <span className="text-acid">[{' '}ok{' '}]</span> {l}
          </p>
        ))}
        <p className="mt-6 text-paper">
          [{'█'.repeat(filled)}
          <span className="text-faint">{'░'.repeat(BAR - filled)}</span>] {String(Math.round(p * 100)).padStart(3, ' ')}%
        </p>
        <p className="mt-2 text-faint">press any key to skip</p>
      </div>
    </div>
  );
}
