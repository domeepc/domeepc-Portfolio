import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { profile } from '@/lib/data';
import { scrollToHash } from '@/lib/smoothScroll';
import ScrambleText from './ascii/ScrambleText';

const navLinks = [
  { href: '#about', label: 'about' },
  { href: '#skills', label: 'stack' },
  { href: '#projects', label: 'work' },
  { href: '#experience', label: 'log' },
  { href: '#contact', label: 'contact' },
];

const PROGRESS_CELLS = 10;

function handleNav(e: React.MouseEvent<HTMLAnchorElement>) {
  const hash = new URL(e.currentTarget.href).hash;
  if (!hash) return;
  e.preventDefault();
  scrollToHash(hash);
}

function useSplitClock() {
  const [time, setTime] = useState('--:--:--');
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Zagreb',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function Navbar(_: { baseUrl?: string }) {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const time = useSplitClock();

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id === 'home' ? '' : `#${e.target.id}`)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    [{ href: '#home' }, ...navLinks].forEach(({ href }) => {
      const el = document.querySelector(href);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflowY = menuOpen ? 'hidden' : '';
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflowY = '';
    };
  }, [menuOpen]);

  const filled = Math.round(progress * PROGRESS_CELLS);

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-[60] border-b border-line bg-ink/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 text-xs md:px-8">
          <a href="#home" onClick={handleNav} className="group flex items-center whitespace-nowrap">
            <span className="text-acid">{profile.handle}</span>
            <span className="text-dim">@portfolio:~$</span>
            <span className="caret" />
          </a>

          <ul className="hidden items-center gap-5 md:flex">
            {navLinks.map((link, i) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={handleNav}
                  className="link-ascii"
                  aria-current={active === link.href ? 'true' : undefined}
                >
                  <span className="text-faint">0{i + 1}.</span>
                  <ScrambleText text={link.label} onView={false} onHover duration={350} />
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-5 text-dim lg:flex" aria-hidden="true">
            <span>
              [<span className="text-acid">{'█'.repeat(filled)}</span>
              <span className="text-faint">{'░'.repeat(PROGRESS_CELLS - filled)}</span>]{' '}
              {String(Math.round(progress * 100)).padStart(3, '0')}%
            </span>
            <span>SPLIT {time}</span>
          </div>

          <button
            className="text-paper md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            [{menuOpen ? 'close' : 'menu'}]
          </button>
        </div>
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-px bg-acid md:hidden"
          style={{ width: `${progress * 100}%` }}
        />
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.5, ease: [0.7, 0, 0.2, 1] }}
            className="fixed inset-0 z-50 flex flex-col justify-center gap-2 bg-ink px-6 pt-16 md:hidden"
          >
            {navLinks.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  handleNav(e);
                  setMenuOpen(false);
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className="flex items-baseline gap-4 border-b border-line py-3 text-4xl font-extrabold uppercase"
              >
                <span className="text-xs font-normal text-acid">0{i + 1}</span>
                <ScrambleText text={link.label} duration={500} />
              </motion.a>
            ))}
            <p className="mt-8 text-xs text-dim">SPLIT, HR — {time}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
