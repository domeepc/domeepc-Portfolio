import { useEffect, useRef } from 'react';
import { GLYPHS, prefersReducedMotion, randomGlyph } from '@/lib/boot';

const POOL = 28;
const SPACING = 16;
const INTERACTIVE = "a, button, [role='button'], input, textarea, select, label, canvas";

/** Block caret cursor that sheds a trail of decaying glyphs. Fine pointers only. */
export default function AsciiCursor() {
  const caretRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const caret = caretRef.current!;
    const trail = trailRef.current!;
    document.documentElement.classList.add('has-ascii-cursor');
    caret.style.display = 'block';
    caret.style.opacity = '0';

    const reduce = prefersReducedMotion();
    const nodes = Array.from({ length: POOL }, () => {
      const n = document.createElement('span');
      n.className = 'absolute left-0 top-0 text-[12px] leading-none text-acid opacity-0';
      trail.appendChild(n);
      return n;
    });
    let next = 0;
    let lastX = -999, lastY = -999;

    const spawn = (x: number, y: number) => {
      const n = nodes[next];
      next = (next + 1) % POOL;
      n.textContent = randomGlyph(GLYPHS);
      n.style.transition = 'none';
      n.style.opacity = '0.9';
      n.style.transform = `translate(${x}px, ${y}px)`;
      // Force a style flush so the fade restarts from full opacity.
      void n.offsetWidth;
      n.style.transition = 'opacity 700ms steps(6), transform 700ms ease-out';
      n.style.opacity = '0';
      n.style.transform = `translate(${x}px, ${y + 10}px)`;
    };

    const onMove = (e: PointerEvent) => {
      caret.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      caret.style.opacity = '1';
      if (reduce) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      if (dx * dx + dy * dy > SPACING * SPACING) {
        spawn(e.clientX + 8, e.clientY + 8);
        lastX = e.clientX;
        lastY = e.clientY;
      }
    };
    const onOver = (e: Event) => {
      const hit = (e.target as Element).closest?.(INTERACTIVE);
      caret.dataset.hover = hit ? '1' : '';
    };
    const onDown = () => (caret.dataset.down = '1');
    const onUp = () => (caret.dataset.down = '');
    const onLeave = () => (caret.style.opacity = '0');
    const onEnter = () => (caret.style.opacity = '1');

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    document.documentElement.addEventListener('pointerleave', onLeave);
    document.documentElement.addEventListener('pointerenter', onEnter);

    return () => {
      document.documentElement.classList.remove('has-ascii-cursor');
      nodes.forEach((n) => n.remove());
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.documentElement.removeEventListener('pointerenter', onEnter);
    };
  }, []);

  return (
    <>
      <div ref={trailRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9998]" />
      <div
        ref={caretRef}
        aria-hidden="true"
        className="group pointer-events-none fixed left-0 top-0 z-[9999] hidden mix-blend-difference"
      >
        <span className="absolute -translate-x-1/2 -translate-y-1/2 text-[18px] leading-none text-white transition-transform duration-200 group-data-[down=1]:scale-75 group-data-[hover=1]:opacity-0">
          █
        </span>
        <span className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-pre text-[20px] leading-none text-white opacity-0 transition-all duration-200 group-data-[hover=1]:opacity-100 group-data-[hover=1]:tracking-[0.6em] tracking-normal">
          [ ]
        </span>
      </div>
    </>
  );
}
