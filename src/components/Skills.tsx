import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { skills } from '@/lib/data';
import type { Skill } from '@/lib/data';
import { prefersReducedMotion } from '@/lib/boot';
import AsciiBox from './ascii/AsciiBox';
import SectionHeader from './ascii/SectionHeader';

const BAR = 16;
const levelCells: Record<Skill['level'], number> = { Expert: 16, Proficient: 12, Learning: 6 };

const groups: { key: Skill['category']; label: string; file: string }[] = [
  { key: 'Language', label: 'languages', file: 'lang.cfg' },
  { key: 'Framework', label: 'frameworks', file: 'fw.cfg' },
  { key: 'Tool', label: 'tooling', file: 'tools.cfg' },
];

/** `[████████░░░░]` that fills one cell at a time once visible. */
function Meter({ level, delay }: { level: Skill['level']; delay: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 1 });
  const target = levelCells[level];
  const [cells, setCells] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) return setCells(target);
    let n = 0;
    let id = 0;
    const start = window.setTimeout(() => {
      id = window.setInterval(() => {
        n += 1;
        setCells(n);
        if (n >= target) clearInterval(id);
      }, 35);
    }, delay);
    return () => {
      clearTimeout(start);
      clearInterval(id);
    };
  }, [inView, target, delay]);

  return (
    <span ref={ref} aria-hidden="true" className="whitespace-pre">
      <span className="text-faint">[</span>
      <span className="text-acid">{'█'.repeat(cells)}</span>
      <span className="text-faint">{'░'.repeat(BAR - cells)}]</span>
    </span>
  );
}

export default function Skills() {
  const names = skills.map((s) => s.name);

  return (
    <section id="skills" className="relative scroll-mt-16 border-t border-line pt-28 md:pt-40">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeader index="02" title="stack" command="ls -la ~/skills" />

        <div className="grid gap-10 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
          {groups.map(({ key, label, file }, g) => (
            <AsciiBox key={key} label={file} className="p-5 pt-7 md:p-6 md:pt-8">
              <h3 className="mb-5 text-xs uppercase tracking-[0.2em] text-dim">
                <span className="text-acid">#</span> {label}
              </h3>
              <ul className="space-y-3 text-[13px]">
                {skills
                  .filter((s) => s.category === key)
                  .map((s, i) => (
                    <li
                      key={s.name}
                      className="group grid grid-cols-[1fr_auto] items-center gap-3 transition-colors hover:text-acid"
                    >
                      <span className="truncate">
                        <span className="text-faint transition-colors group-hover:text-acid">›</span> {s.name}
                      </span>
                      <span className="flex items-center gap-3">
                        <Meter level={s.level} delay={g * 120 + i * 60} />
                        <span className="w-[4ch] text-right text-[10px] uppercase text-dim">
                          {s.level.slice(0, 3)}
                        </span>
                        <span className="sr-only">{s.level}</span>
                      </span>
                    </li>
                  ))}
              </ul>
            </AsciiBox>
          ))}
        </div>

        <p className="mt-6 text-[11px] uppercase tracking-[0.15em] text-faint">
          legend: <span className="text-dim">exp</span> expert · <span className="text-dim">pro</span> proficient ·{' '}
          <span className="text-dim">lea</span> learning
        </p>
      </div>

      <div aria-hidden="true" className="mt-24 space-y-2 border-t border-line py-6 md:mt-32">
        {[false, true].map((reverse) => (
          <div key={String(reverse)} className="marquee overflow-hidden">
            <div
              className="marquee-track flex w-max text-[clamp(2rem,6vw,4.5rem)] font-extrabold uppercase leading-none"
              data-reverse={reverse || undefined}
              style={{ ['--speed' as string]: reverse ? '70s' : '55s' }}
            >
              {[0, 1].map((copy) => (
                <span key={copy} className="flex shrink-0">
                  {names.map((n) => (
                    <span
                      key={n}
                      className={`px-[0.4em] transition-colors hover:text-acid ${reverse ? 'text-transparent [-webkit-text-stroke:1px_var(--color-faint)]' : 'text-paper'}`}
                    >
                      {n}
                      <span className="pl-[0.8em] text-acid">/</span>
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
