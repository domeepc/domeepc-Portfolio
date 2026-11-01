import { useEffect, useRef, useState } from "react";
import { useReveal } from "@/hooks/useReveal";
import { profile } from "@/lib/data";
import { firstBanner, lastBanner } from "@/lib/ascii";
import { onBooted, prefersReducedMotion } from "@/lib/boot";
import { scrollToHash } from "@/lib/smoothScroll";
import AsciiDonut from "./ascii/AsciiDonut";
import AsciiReveal from "./ascii/AsciiReveal";
import ScrambleText from "./ascii/ScrambleText";

const ROLES = [
  "computer engineering student",
  "embedded C/C++ @ FESB Racing",
  "java intern @ Abysalto",
  "full-stack typescript dev",
];

const TICKER = [
  "currently interning @ abysalto",
  "based in split, croatia",
  "web · embedded · algorithms",
  "currently shipping activitysearch.eu",
  "writes C for an electric formula car",
];

const SPINNER = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";

function useTypewriter(words: string[]) {
  const [text, setText] = useState(words[0]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let word = 0,
      len = words[0].length,
      deleting = true;
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
    const off = onBooted(() => {
      timer = window.setTimeout(tick, 2600);
    });
    return () => {
      off();
      clearTimeout(timer);
    };
  }, [words]);

  return text;
}

function Role() {
  return <span className="caret">{useTypewriter(ROLES)}</span>;
}

function Spinner() {
  const ref = useRef<HTMLSpanElement>(null);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let id = 0;
    const io = new IntersectionObserver(([entry]) => {
      clearInterval(id);
      if (entry.isIntersecting) id = window.setInterval(() => setI((n) => (n + 1) % SPINNER.length), 90);
    });
    io.observe(ref.current!);
    return () => {
      io.disconnect();
      clearInterval(id);
    };
  }, []);
  return (
    <span ref={ref} aria-hidden="true">
      {SPINNER[i]}
    </span>
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  return (
    <section
      ref={ref}
      tabIndex={-1}
      id="home"
      className="relative flex min-h-[100svh] flex-col overflow-hidden pt-16"
    >
      <AsciiDonut className="pointer-events-none absolute inset-x-0 bottom-12 top-16 h-[calc(100%-7rem)] w-full opacity-10 lg:left-auto lg:right-[-10%] lg:w-[50%] lg:opacity-90" />

      <div
        data-hero-content=""
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 py-12 md:px-8">
        <dl data-hero=""
          className="mb-10 grid grid-cols-2 gap-x-6 gap-y-3 text-[11px] uppercase tracking-[0.15em] text-dim md:grid-cols-4 md:max-w-3xl"
        >
          {[
            ["index", "portfolio/v2026"],
            ["coords", profile.coords],
            ["focus", "web + embedded"],
            [
              "status",
              <span key="s" className="text-dim">
                <span className="text-acid">●</span> employed
              </span>,
            ],
          ].map(([k, v]) => (
            <div key={k as string}>
              <dt className="text-faint">{k}</dt>
              <dd className="text-paper">{v}</dd>
            </div>
          ))}
        </dl>

        <h1 className="sr-only">
          {profile.name} — {profile.title}
        </h1>
        <div
          aria-hidden="true"
          className="text-[min(17px,calc((100vw-2rem)/46))] md:text-[min(17px,calc((100vw-4rem)/46))]"
        >
          <AsciiReveal
            art={firstBanner}
            label={profile.name.split(" ")[0]}
            delay={100}
          />
          <AsciiReveal
            art={lastBanner}
            label={profile.name.split(" ")[1]}
            className="mt-[0.6em] text-acid"
            delay={350}
          />
        </div>

        <p data-hero="" className="mt-10 text-base md:text-lg">
          <span className="text-acid">&gt;</span>{" "}
          <Role />
        </p>

        <p data-hero=""
          className="mt-4 max-w-xl text-sm leading-relaxed text-dim"
        >
          {profile.bio}
        </p>

        <div data-hero="" className="mt-10 flex flex-wrap gap-3">
          <a
            href={profile.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ascii"
          >
            <ScrambleText text="github" onView={false} onHover />
            <span className="arrow">→</span>
          </a>
          <a
            href={profile.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ascii"
          >
            <ScrambleText text="linkedin" onView={false} onHover />
            <span className="arrow">→</span>
          </a>
          <a
            href="#projects"
            onClick={(e) => {
              e.preventDefault();
              scrollToHash("#projects");
            }}
            className="btn-ascii border-transparent text-dim hover:text-ink"
          >
            <ScrambleText text="see work" onView={false} onHover />
            <span className="arrow">↓</span>
          </a>
        </div>
      </div>

      <div data-hero=""
        className="relative z-10 border-y border-line bg-ink/80 text-xs uppercase tracking-[0.15em]"
      >
        <div className="mx-auto flex max-w-7xl items-center">
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              scrollToHash("#about");
            }}
            className="flex shrink-0 items-center gap-2 border-r border-line px-4 py-3 text-acid md:px-8"
          >
            <Spinner /> scroll
          </a>
          <div className="marquee flex-1 overflow-hidden py-3">
            <div
              className="marquee-track flex w-max text-dim"
              style={{ ["--speed" as string]: "45s" }}
            >
              {[0, 1].map((copy) => (
                <span
                  key={copy}
                  aria-hidden={copy === 1}
                  className="flex shrink-0"
                >
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
      </div>
    </section>
  );
}
