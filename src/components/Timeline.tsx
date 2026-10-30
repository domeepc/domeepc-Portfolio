import { motion } from 'framer-motion';
import { timeline } from '@/lib/data';
import type { TimelineEntry } from '@/lib/data';
import SectionHeader from './ascii/SectionHeader';
import ScrambleText from './ascii/ScrambleText';

/** Stable fake short-SHA so every entry reads like a real commit. */
function shortSha(input: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) h = Math.imul(h ^ input.charCodeAt(i), 16777619);
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7);
}

const typeTag: Record<TimelineEntry['type'], string> = {
  work: 'work',
  education: 'edu',
  project: 'proj',
};

export default function Timeline() {
  const entries = [...timeline].reverse();

  return (
    <section id="experience" className="relative scroll-mt-16 border-t border-line py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeader index="04" title="log" command="git log --graph --all" />

        <ol className="relative max-w-4xl">
          {entries.map((entry, i) => {
            const isHead = i === 0;
            return (
              <motion.li
                key={entry.title}
                className="group grid grid-cols-[3ch_1fr] gap-x-3 md:grid-cols-[4ch_1fr] md:gap-x-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.4 }}
              >
                {/* Graph gutter: a commit node and the rail below it */}
                <div aria-hidden="true" className="flex flex-col items-center">
                  <motion.span
                    className="text-lg leading-6 text-acid"
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
                  >
                    {entry.current ? '◉' : '*'}
                  </motion.span>
                  {i < entries.length - 1 && (
                    <motion.span
                      className="w-px flex-1 origin-top bg-[repeating-linear-gradient(to_bottom,var(--color-faint)_0_6px,transparent_6px_10px)]"
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: 0.2, ease: [0.7, 0, 0.2, 1] }}
                    />
                  )}
                </div>

                <div className="pb-14">
                  <p className="text-xs leading-6">
                    <span className="text-acid">commit {shortSha(entry.title)}</span>
                    {isHead && (
                      <span className="text-dim">
                        {' '}(<span className="text-acid">HEAD</span> → <span className="text-paper">main</span>)
                      </span>
                    )}
                    <span className="text-dim"> [{typeTag[entry.type]}]</span>
                  </p>
                  <p className="mt-1 text-xs text-dim">
                    Date: &nbsp;{entry.year}
                    {entry.current && <span className="ml-3 text-acid">● running</span>}
                  </p>
                  <h3 className="mt-4 text-[clamp(1.25rem,2.6vw,2rem)] font-bold leading-tight transition-colors group-hover:text-acid">
                    <ScrambleText text={entry.title} duration={700} />
                  </h3>
                  <p className="mt-1 text-sm text-dim">
                    @ {entry.website ? (
                      <a href={entry.website} target="_blank" rel="noopener noreferrer" className="link-ascii text-paper">
                        {entry.institution}
                      </a>
                    ) : (
                      entry.institution
                    )}
                  </p>
                  <p className="mt-4 max-w-2xl border-l border-line pl-4 text-sm leading-relaxed text-dim">
                    {entry.description}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ol>
        <p className="grid max-w-4xl grid-cols-[3ch_1fr] gap-x-3 text-xs text-faint md:grid-cols-[4ch_1fr] md:gap-x-6">
          <span className="text-center text-acid">$</span>
          <span className="caret" />
        </p>
      </div>
    </section>
  );
}
