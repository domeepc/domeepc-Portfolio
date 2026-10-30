import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { repos } from '@/lib/data';
import type { Repo } from '@/lib/data';
import SectionHeader from './ascii/SectionHeader';
import ScrambleText from './ascii/ScrambleText';

const PREVIEW_WIDTH = 340;

function formatDate(iso: string) {
  return iso.slice(0, 7).replace('-', '.');
}

/** Terminal card that trails the pointer while a row is hovered (desktop only). */
function Preview({ repo }: { repo: Repo }) {
  return (
    <motion.div
      className="w-[340px] border border-acid bg-ink p-4 text-[11px] leading-relaxed shadow-[8px_8px_0_0_var(--color-acid)]"
      initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <p className="mb-2 flex justify-between text-dim">
        <span>~/{repo.name}</span>
        <span>● ● ●</span>
      </p>
      <p>
        <span className="text-acid">$</span> git clone github.com/domeepc/{repo.name}
      </p>
      <p className="text-dim">Cloning into '{repo.name}'... done.</p>
      <p>
        <span className="text-acid">$</span> cat README.md | head -1
      </p>
      <p className="text-dim">{repo.description}</p>
      <p className="mt-2">
        <span style={{ color: repo.languageColor }}>■</span> {repo.language}
        <span className="text-dim"> · updated {formatDate(repo.updatedAt)}</span>
      </p>
    </motion.div>
  );
}

export default function Projects() {
  const listRef = useRef<HTMLOListElement>(null);
  const [hovered, setHovered] = useState<Repo | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const rect = listRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left + 24;
    // Keep the card in the right half so it never covers the project title.
    const px = Math.min(Math.max(x, rect.width * 0.5), rect.width - PREVIEW_WIDTH);
    const py = e.clientY - rect.top - 80;
    if (previewRef.current) previewRef.current.style.transform = `translate(${px}px, ${py}px)`;
  };

  return (
    <section id="projects" className="relative scroll-mt-16 border-t border-line py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeader index="03" title="work" command="git log --oneline --repos" />

        <div className="hidden grid-cols-12 gap-4 border-b border-line pb-3 text-[11px] uppercase tracking-[0.15em] text-faint md:grid">
          <span className="col-span-1">id</span>
          <span className="col-span-6">project</span>
          <span className="col-span-2">lang</span>
          <span className="col-span-2">updated</span>
          <span className="col-span-1 text-right">↗</span>
        </div>

        <ol ref={listRef} className="relative" onPointerMove={onMove} onPointerLeave={() => setHovered(null)}>
          {repos.map((repo, i) => (
            <motion.li
              key={repo.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
              onPointerEnter={() => setHovered(repo)}
              className="group relative isolate border-b border-line"
            >
              {/* Hard-edged fill that wipes in from the left on hover */}
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-10 origin-left scale-x-0 bg-acid transition-transform duration-500 ease-[cubic-bezier(.7,0,.2,1)] group-hover:scale-x-100"
              />
              <div className="grid grid-cols-12 items-baseline gap-x-4 gap-y-2 px-1 py-7 transition-colors duration-300 group-hover:text-ink md:py-9">
                <span className="col-span-2 text-xs text-dim group-hover:text-ink md:col-span-1">
                  {String(i + 1).padStart(3, '0')}
                </span>
                <h3 className="col-span-10 text-[clamp(1.75rem,4.5vw,3.75rem)] font-extrabold uppercase leading-none tracking-tight md:col-span-6">
                  <a href={repo.url} target="_blank" rel="noopener noreferrer" className="after:absolute after:inset-0">
                    <ScrambleText text={repo.name} onHover duration={500} />
                  </a>
                </h3>
                <span className="col-span-6 col-start-3 text-xs md:col-span-2 md:col-start-auto">
                  <span style={{ color: repo.languageColor }} className="group-hover:text-ink">■</span> {repo.language}
                </span>
                <span className="col-span-4 text-xs text-dim group-hover:text-ink md:col-span-2">
                  {formatDate(repo.updatedAt)}
                </span>
                <span className="hidden text-right text-2xl transition-transform duration-300 group-hover:-rotate-45 md:col-span-1 md:block">
                  →
                </span>
                <p className="col-span-10 col-start-3 max-w-xl text-sm text-dim group-hover:text-ink md:col-span-6 md:col-start-2">
                  {repo.description}
                </p>
                {repo.homepage && (
                  <a
                    href={repo.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative z-10 col-span-10 col-start-3 w-fit text-xs uppercase tracking-[0.15em] text-acid hover:underline group-hover:text-ink whitespace-nowrap md:col-span-4 md:col-start-auto"
                  >
                    <span className="animate-pulse">●</span> live → {new URL(repo.homepage).host}
                  </a>
                )}
              </div>
            </motion.li>
          ))}
          <div
            ref={previewRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-20 hidden transition-transform duration-300 ease-out lg:block"
          >
            <AnimatePresence>{hovered && <Preview key={hovered.name} repo={hovered} />}</AnimatePresence>
          </div>
        </ol>

        <div className="mt-12 flex justify-end">
          <a
            href="https://github.com/domeepc?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ascii"
          >
            <ScrambleText text="all repositories" onView={false} onHover />
            <span className="arrow">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
