import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { profile } from '@/lib/data';
import { firstBanner, lastBanner } from '@/lib/ascii';
import { onBooted, prefersReducedMotion } from '@/lib/boot';
import { scrollToHash } from '@/lib/smoothScroll';
import AsciiDonut from './ascii/AsciiDonut';
import AsciiReveal from './ascii/AsciiReveal';
import ScrambleText from './ascii/ScrambleText';

const ROLES = [
  'computer engineering student',
  'embedded C/C++ @ FESB Racing',
  'java intern @ Abysalto',
  'full-stack typescript dev',
];

const TICKER = [
  'currently interning @ abysalto',
  'based in split, croatia',
  'web · embedded · algorithms',
  'currently shipping activitysearch.eu',
  'writes C for an electric formula car',
];

const SPINNER = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏';

function useTypewriter(words: string[]) {
  const [text, setText] = useState(words[0]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let word = 0, len = words[0].length, deleting = true;
    let timer = 0;
    const tick = () => {
      const current = words[word];
      len += deleting ? -1 : 1;
      setText(current.slice(0, len));
      let wait = deleting ? 28 : 55 + Math.random() * 60;
      if (!deleting && len === current.length) {
        deleting = true;
        wait = 2200;
      } else if (deleting && len === 0) {
        deleting = false;
        word = (word + 1) % words.length;
        wait = 300;
      }
      timer = window.setTimeout(tick, wait);
    };
    const off = onBooted(() => { timer = window.setTimeout(tick, 2600); });
    return () => {
      off();
      clearTimeout(timer);
    };
  }, [words]);

  return text;
}

function useSpinner() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setInterval(() => setI((n) => (n + 1) % SPINNER.length), 90);
    return () => clearInterval(id);
  }, []);
  return SPINNER[i];
}

export default function Hero() {
  const role = useTypewriter(ROLES);
  const spinner = useSpinner();
  const [ready, setReady] = useState(false);

  useEffect(() => onBooted(() => setReady(true)), []);

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: ready ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] as const },
  });

  return (
    <section id="home" className="relative flex min-h-[100svh] flex-col overflow-hidden pt-16">
      <AsciiDonut className="pointer-events-none absolute inset-0 h-full w-full opacity-15 md:left-auto md:right-[-12%] md:w-[50%] md:opacity-90" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 py-12 md:px-8">
        <motion.dl
          {...fade(0)}
          className="mb-10 grid grid-cols-2 gap-x-6 gap-y-3 text-[11px] uppercase tracking-[0.15em] text-dim md:grid-cols-4 md:max-w-3xl"
        >
          {[
            ['index', 'portfolio/v2026'],
            ['coords', '43.55°N 16.36°E'],
            ['focus', 'web + embedded'],
            ['status', <span key="s" className="text-dim"><span className="text-acid">●</span> employed</span>],
          ].map(([k, v]) => (
            <div key={k as string}>
              <dt className="text-faint">{k}</dt>
              <dd className="text-paper">{v}</dd>
            </div>
          ))}
        </motion.dl>

        <h1 className="sr-only">{profile.name} — {profile.title}</h1>
        <div aria-hidden="true" className="text-[min(17px,calc((100vw-2rem)/46))] md:text-[min(17px,calc((100vw-4rem)/46))]">
          <AsciiReveal art={firstBanner} label={profile.name.split(' ')[0]} delay={100} />
          <AsciiReveal
            art={lastBanner}
            label={profile.name.split(' ')[1]}
            className="mt-[0.6em] text-acid"
            delay={350}
          />
        </div>

        <motion.p {...fade(0.9)} className="mt-10 text-base md:text-lg">
          <span className="text-acid">&gt;</span> <span className="caret">{role}</span>
        </motion.p>

        <motion.p {...fade(1)} className="mt-4 max-w-xl text-sm leading-relaxed text-dim">
          {profile.bio}
        </motion.p>

        <motion.div {...fade(1.1)} className="mt-10 flex flex-wrap gap-3">
          <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-ascii">
            <ScrambleText text="github" onView={false} onHover />
            <span className="arrow">→</span>
          </a>
          <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="btn-ascii">
            <ScrambleText text="linkedin" onView={false} onHover />
            <span className="arrow">→</span>
          </a>
          <a
            href="#projects"
            onClick={(e) => { e.preventDefault(); scrollToHash('#projects'); }}
            className="btn-ascii border-transparent text-dim hover:text-ink"
          >
            <ScrambleText text="see work" onView={false} onHover />
            <span className="arrow">↓</span>
          </a>
        </motion.div>
      </div>

      <motion.div {...fade(1.3)} className="relative z-10 border-y border-line bg-ink/80 text-xs uppercase tracking-[0.15em]">
        <div className="mx-auto flex max-w-7xl items-center">
          <a
            href="#about"
            onClick={(e) => { e.preventDefault(); scrollToHash('#about'); }}
            className="flex shrink-0 items-center gap-2 border-r border-line px-4 py-3 text-acid md:px-8"
          >
            <span aria-hidden="true">{spinner}</span> scroll
          </a>
          <div className="marquee flex-1 overflow-hidden py-3">
            <div className="marquee-track flex w-max text-dim" style={{ ['--speed' as string]: '45s' }}>
              {[0, 1].map((copy) => (
                <span key={copy} aria-hidden={copy === 1} className="flex shrink-0">
                  {TICKER.map((t) => (
                    <span key={t} className="px-6">
                      <span className="text-acid">*</span> {t}
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
