import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { profile } from '@/lib/data';
import { scrollToHash } from '@/lib/smoothScroll';

const navLinks = [
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
  { href: '#experience', label: 'Experience' },
  { href: '#contact', label: 'Contact' },
];

function handleNav(e: React.MouseEvent<HTMLAnchorElement>) {
  const hash = new URL(e.currentTarget.href).hash;
  if (!hash) return;
  e.preventDefault();
  scrollToHash(hash);
}

export default function Navbar({ baseUrl = '/' }: { baseUrl?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflowY = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflowY = ''; };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-violet-900/30 shadow-lg shadow-violet-900/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#home"
            onClick={handleNav}
            className="flex items-center gap-2 font-bold text-foreground hover:text-violet-400 transition-colors"
          >
            <div className="p-1 rounded-md bg-violet-500/15 border border-violet-500/25">
              <img src={`${baseUrl}/dm-logo.svg`} alt="DM logo" width={16} height={16} className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold font-syne">{profile.handle}</span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleNav}
                className="text-sm text-muted-foreground hover:text-violet-400 transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden relative z-[60] p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile fullscreen overlay — outside nav so CSS transform doesn't break fixed positioning */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-8"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { handleNav(e); setMenuOpen(false); }}
                className="text-2xl font-semibold font-syne text-muted-foreground hover:text-violet-400 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
