import { useEffect, useRef, useState } from 'react';
import { profile } from '@/lib/data';
import { talkBanner } from '@/lib/ascii';
import { smoothScrollTo } from '@/lib/smoothScroll';
import AsciiBox from './ascii/AsciiBox';
import AsciiReveal from './ascii/AsciiReveal';
import ScrambleText from './ascii/ScrambleText';

type Line = { kind: 'in' | 'out'; text: string };

const PROMPT = 'guest@domeepc:~$';

const COMMANDS: Record<string, () => string | { open: string; text: string }> = {
  help: () => 'commands: whoami · github · linkedin · location · stack · clear · sudo hire-me',
  whoami: () => `${profile.name} — ${profile.title}`,
  github: () => ({ open: profile.githubUrl, text: `opening ${profile.githubUrl} ...` }),
  linkedin: () => ({ open: profile.linkedinUrl, text: 'opening linkedin ...' }),
  location: () => `${profile.location} · ${profile.coords}`,
  stack: () => 'ts · js · c · c++ · java · react · node · spring boot · astro',
  'sudo hire-me': () => ({ open: profile.linkedinUrl, text: 'permission granted. routing you to linkedin ...' }),
};

function Terminal() {
  const [lines, setLines] = useState<Line[]>([
    { kind: 'out', text: "type 'help' to list commands" },
  ]);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    setHistory((h) => [cmd, ...h]);
    setCursor(-1);
    if (cmd === 'clear') return setLines([]);
    const result = COMMANDS[cmd]?.();
    let out: string;
    if (!result) out = `command not found: ${cmd}`;
    else if (typeof result === 'string') out = result;
    else {
      out = result.text;
      window.open(result.open, '_blank', 'noopener,noreferrer');
    }
    setLines((l) => [...l, { kind: 'in', text: cmd }, { kind: 'out', text: out }]);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(-1, Math.min(history.length - 1, cursor + (e.key === 'ArrowUp' ? 1 : -1)));
      setCursor(next);
      setValue(next === -1 ? '' : history[next]);
    } else if (e.key === 'Tab') {
      const match = Object.keys(COMMANDS).find((c) => value && c.startsWith(value.toLowerCase()));
      if (match) {
        e.preventDefault();
        setValue(match);
      }
    }
  };

  return (
    <AsciiBox label="tty1" className="flex h-full flex-col p-5 pt-7 text-[13px]">
      <div
        ref={scrollRef}
        className="h-56 overflow-y-auto pr-2"
        onClick={() => inputRef.current?.focus()}
        aria-live="polite"
      >
        {lines.map((l, i) => (
          <p key={i} className={l.kind === 'out' ? 'text-dim' : ''}>
            {l.kind === 'in' && <span className="text-acid">{PROMPT} </span>}
            {l.text}
          </p>
        ))}
        <form
          className="flex"
          onSubmit={(e) => {
            e.preventDefault();
            run(value);
            setValue('');
          }}
        >
          <label htmlFor="term" className="shrink-0 text-acid">
            {PROMPT}&nbsp;
          </label>
          <input
            id="term"
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKey}
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-paper caret-acid outline-none"
            aria-label="Terminal command"
          />
        </form>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
        {['help', 'whoami', 'stack', 'sudo hire-me'].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => run(c)}
            className="border border-line px-2 py-1 text-[11px] text-dim transition-colors hover:border-acid hover:text-acid"
          >
            {c}
          </button>
        ))}
      </div>
    </AsciiBox>
  );
}

export default function Contact() {
  return (
    <footer id="contact" className="relative scroll-mt-16 border-t border-line pt-28 md:pt-40">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex items-center gap-4 text-xs tracking-[0.2em] text-dim">
          <span className="text-acid">// 05</span>
          <span aria-hidden="true" className="flex-1 overflow-hidden whitespace-nowrap text-faint">
            {'─'.repeat(240)}
          </span>
          <span>CONTACT</span>
        </div>

        <h2 className="sr-only">Say hi</h2>
        <div aria-hidden="true" className="mt-12 overflow-hidden text-[min(26px,calc((100vw-2rem)/25))] text-acid">
          <AsciiReveal art={talkBanner} label="Say hi" duration={1300} />
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="space-y-8">
            <p className="max-w-md text-lg leading-relaxed">
              Got a project, a question, or a weird embedded bug? My DMs are open —
              ping me on any channel below, or poke the terminal.
            </p>
            <ul className="divide-y divide-line border-y border-line">
              {[
                { label: 'github', href: profile.githubUrl, sub: `@${profile.handle}` },
                { label: 'linkedin', href: profile.linkedinUrl, sub: 'domagoj-milardović' },
              ].map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-baseline justify-between gap-4 py-5 transition-colors hover:text-acid"
                  >
                    <span className="text-3xl font-extrabold uppercase md:text-4xl">
                      <ScrambleText text={l.label} onView={false} onHover duration={400} />
                    </span>
                    <span className="flex items-center gap-3 text-xs text-dim">
                      {l.sub}
                      <span className="text-lg transition-transform duration-300 group-hover:-rotate-45 group-hover:text-acid">
                        →
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <Terminal />
        </div>

        <div className="mt-28 flex flex-col gap-4 border-t border-line py-8 text-[11px] uppercase tracking-[0.15em] text-dim md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {profile.name}</p>
          <p className="text-faint">built with astro + react · rendered in 0x7f characters</p>
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              smoothScrollTo(0);
            }}
            className="link-ascii"
          >
            back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
