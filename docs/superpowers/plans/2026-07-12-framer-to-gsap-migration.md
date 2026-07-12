# Framer Motion → GSAP Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `framer-motion` with `gsap` + `@gsap/react` across all 9 files that currently use it, with no visual/behavioral regressions, then remove the `framer-motion` dependency.

**Architecture:** Each component gets its own `useGSAP` hook call (from `@gsap/react`) scoped to a container ref. Scroll-triggered reveals use `ScrollTrigger` with `once: true` (or `toggleActions` equivalent) to replicate the current `useInView({ once: true })` behavior. The Timeline component's scroll-scrubbed effect uses `ScrollTrigger` with `scrub` driving `gsap.set()` calls computed via `gsap.utils.mapRange`/`clamp`. Continuous pointer-following (cursor, Hero parallax) uses `gsap.quickTo()`.

**Tech Stack:** Astro (React islands via `client:load`/`client:visible`), React 19, `gsap`, `@gsap/react` (`useGSAP` hook), TypeScript.

## Global Constraints

- Node >= 22.12.0 (from `package.json` `engines`).
- No test framework exists in this repo (no vitest/jest/playwright configured) — verification for every task is `npm run build` (catches TypeScript/import errors via Astro's build-time checks) plus a manual visual check via `npm run dev`. Do not add a test framework as part of this migration — out of scope per the design spec.
- `framer-motion` (`^12.38.0`) stays installed until the final task (Task 10) — do not remove it early, other not-yet-converted components still depend on it.
- All GSAP code must run client-side only (inside `useGSAP`/`useEffect`), never at module top level — these components hydrate as Astro islands (`client:load` in `src/pages/index.astro:13,15` and `src/layouts/Layout.astro:42`; `client:visible` in `src/pages/index.astro:16-20`).
- Default easing for one-shot reveal tweens: `power2.out` (closest visual match to Framer Motion's default tween curve). Default easing for continuous/pointer-follow tweens: `power3.out`. These are approximations, not exact spring-physics matches — acceptable per the design spec's fidelity note.
- Preserve every existing Tailwind class, DOM structure, and data value exactly; only swap the animation mechanism.

---

## File Structure

| File | Change |
|---|---|
| `src/lib/gsap.ts` | **Create.** Registers `ScrollTrigger` and `useGSAP` once, re-exports `gsap`, `ScrollTrigger`, `useGSAP`. |
| `src/components/About.tsx` | Modify — replace `useScrollAnimation`/`motion.div` with `useGSAP` timeline. |
| `src/components/Skills.tsx` | Modify — same pattern. |
| `src/components/Projects.tsx` | Modify — same pattern + hover lift via `gsap.to` on mouseenter/leave. |
| `src/components/Contact.tsx` | Modify — same pattern + footer copy fix ("Framer Motion" → "GSAP"). |
| `src/components/Timeline.tsx` | Modify — mobile cards get per-card `ScrollTrigger`; desktop sticky section gets scrub-driven `ScrollTrigger`. |
| `src/components/Hero.tsx` | Modify — mount timeline + `quickTo`-based mouse parallax. |
| `src/components/Navbar.tsx` | Modify — mount fade + always-mounted mobile menu toggled via `gsap.to`. |
| `src/components/CustomCursor.tsx` | Modify — `quickTo` per tracked property, replacing motion values/springs. |
| `src/hooks/useScrollAnimation.ts` | **Delete** in the final task — no longer used once all consumers are converted. |
| `package.json` | Modify — add `gsap`, `@gsap/react`; remove `framer-motion` in the final task. |

---

### Task 1: Add GSAP dependencies and shared setup module

**Files:**
- Modify: `package.json`
- Create: `src/lib/gsap.ts`

**Interfaces:**
- Produces: `gsap` (default export of the `gsap` package, re-exported), `ScrollTrigger` (named export), `useGSAP` (named export) — all subsequent tasks import these three from `@/lib/gsap`.

- [ ] **Step 1: Install dependencies**

Run: `npm install gsap @gsap/react`

Expected: `package.json` `dependencies` gains `"gsap"` and `"@gsap/react"` entries; `package-lock.json` updates.

- [ ] **Step 2: Create the shared GSAP setup module**

```ts
// src/lib/gsap.ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };
```

- [ ] **Step 3: Verify the build still passes**

Run: `npm run build`
Expected: build succeeds (no TypeScript errors resolving the new imports/module).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/lib/gsap.ts
git commit -m "chore: add gsap and @gsap/react dependencies"
```

---

### Task 2: Convert About.tsx

**Files:**
- Modify: `src/components/About.tsx`

**Interfaces:**
- Consumes: `gsap`, `useGSAP` from `@/lib/gsap` (Task 1).

- [ ] **Step 1: Replace the file contents**

```tsx
// src/components/About.tsx
import { useRef } from "react";
import {
  MapPin,
  GraduationCap,
  GitBranch,
  Workflow,
} from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { profile } from "@/lib/data";

const highlights = [
  {
    icon: GraduationCap,
    label: "University of Split",
    sub: "Computer Engineering",
  },
  { icon: MapPin, label: profile.location, sub: "Croatia" },
  { icon: GitBranch, label: "11+ Repositories", sub: "Open Source" },
  { icon: Workflow, label: "Intern Java Developer", sub: "Abysalto" },
];

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        once: true,
      },
      defaults: { ease: "power2.out" },
    });

    tl.from(".about-header", { opacity: 0, y: 30, duration: 0.6 }, 0)
      .from(".about-avatar", { opacity: 0, x: -40, duration: 0.7 }, 0.1)
      .from(".about-text", { opacity: 0, x: 40, duration: 0.7 }, 0.2)
      .from(
        ".about-highlight",
        { opacity: 0, y: 20, duration: 0.5, stagger: 0.1 },
        0.3
      );
  }, { scope: containerRef });

  return (
    <section id="about" className="py-28 px-6 relative overflow-x-hidden">
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-background/40 to-transparent pointer-events-none" />
      <div className="max-w-5xl mx-auto" ref={containerRef}>
        {/* Section header */}
        <div className="about-header text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-3">
            About Me
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Who I <span className="gradient-text">Am</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Avatar & decorative frame */}
          <div className="about-avatar flex justify-center">
            <div className="relative">
              {/* Decorative rings */}
              <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 scale-110" />
              <div className="absolute inset-0 rounded-full border border-violet-500/10 scale-125" />
              {/* Glow */}
              <div className="absolute inset-0 rounded-full bg-violet-600/20 blur-2xl scale-110" />
              {/* Avatar */}
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="relative w-56 h-56 rounded-full object-cover border-2 border-violet-500/40 shadow-2xl shadow-violet-900/40"
              />
            </div>
          </div>

          {/* Text content */}
          <div className="about-text space-y-6">
            <p className="text-muted-foreground leading-relaxed text-base">
              {profile.bio}
            </p>
            <p className="text-muted-foreground leading-relaxed text-base">
              My work spans from building full-stack TypeScript web applications
              deployed to production, to writing C firmware for embedded
              hardware. I enjoy the full spectrum of software — from low-level
              system programming to modern web interfaces.
            </p>

            {/* Highlights grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="about-highlight flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-violet-500/30 transition-colors"
                >
                  <div className="p-2 rounded-md bg-violet-500/10">
                    <item.icon size={16} className="text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground leading-none">
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds, no leftover `framer-motion`/`useScrollAnimation` imports in this file.

- [ ] **Step 3: Manual visual check**

Run: `npm run dev`, open the site, scroll to the About section.
Expected: header fades/slides up, avatar slides in from the left, text slides in from the right, the four highlight chips fade up in a staggered sequence — matching the previous feel. Scroll away and back: animation does not replay (once-only).

- [ ] **Step 4: Commit**

```bash
git add src/components/About.tsx
git commit -m "refactor: migrate About.tsx from framer-motion to gsap"
```

---

### Task 3: Convert Skills.tsx

**Files:**
- Modify: `src/components/Skills.tsx`

**Interfaces:**
- Consumes: `gsap`, `useGSAP` from `@/lib/gsap`.

- [ ] **Step 1: Update imports and replace scroll-reveal wrappers**

Replace line 1 (`import { motion } from 'framer-motion';`) and line 2 (`import { useScrollAnimation } from '@/hooks/useScrollAnimation';`) with:

```tsx
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
```

Replace the component body (from `export default function Skills()` to the closing `}`) with:

```tsx
export default function Skills() {
  const containerRef = useRef<HTMLDivElement>(null);

  const languages  = skills.filter((s) => s.category === 'Language');
  const frameworks = skills.filter((s) => s.category === 'Framework');
  const tools      = skills.filter((s) => s.category === 'Tool');

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        once: true,
      },
      defaults: { ease: 'power2.out' },
    });

    tl.from('.skills-header', { opacity: 0, y: 30, duration: 0.6 }, 0)
      .from('.skills-marquee', { opacity: 0, duration: 0.6 }, 0.2)
      .from('.skills-legend', { opacity: 0, duration: 0.6 }, 0.5);
  }, { scope: containerRef });

  return (
    <section id="skills" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-background/40 to-transparent pointer-events-none" />
      <div className="max-w-5xl mx-auto" ref={containerRef}>
        {/* Section header */}
        <div className="skills-header text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-3">
            Technical Skills
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What I <span className="gradient-text">Work With</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto">
            From low-level C firmware to full-stack TypeScript — a look at my technical toolkit.
          </p>
        </div>

        {/* Marquee rows */}
        <div className="skills-marquee space-y-10">
          <MarqueeRow items={languages}  direction="left"  speed={22} label="Languages" />
          <MarqueeRow items={frameworks} direction="right" speed={26} label="Frameworks & Runtimes" />
          <MarqueeRow items={tools}      direction="left"  speed={18} label="Tools & Platforms" />
        </div>

        {/* Legend */}
        <div className="skills-legend flex flex-wrap gap-6 justify-center mt-12 text-xs text-muted-foreground">
          {(['Expert', 'Proficient', 'Learning'] as const).map((level) => (
            <div key={level} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${levelDot[level]}`} />
              {level}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

`SkillPill` and `MarqueeRow` (lines 18-77 in the original file) are unchanged — leave them as-is.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Manual visual check**

Run: `npm run dev`, scroll to Skills section.
Expected: header fades up, marquee rows fade in (marquees keep scrolling via existing CSS `marquee-scroll` animation, untouched), legend fades in last. Once-only on scroll back.

- [ ] **Step 4: Commit**

```bash
git add src/components/Skills.tsx
git commit -m "refactor: migrate Skills.tsx from framer-motion to gsap"
```

---

### Task 4: Convert Projects.tsx

**Files:**
- Modify: `src/components/Projects.tsx`

**Interfaces:**
- Consumes: `gsap`, `useGSAP` from `@/lib/gsap`.

- [ ] **Step 1: Replace the file contents**

```tsx
// src/components/Projects.tsx
import { useRef } from 'react';
import { ExternalLink, GitBranch, Globe } from 'lucide-react';
import { gsap, useGSAP } from '@/lib/gsap';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { repos } from '@/lib/data';

function onCardEnter(e: React.MouseEvent<HTMLDivElement>) {
  gsap.to(e.currentTarget, { y: -6, duration: 0.2, ease: 'power2.out' });
}

function onCardLeave(e: React.MouseEvent<HTMLDivElement>) {
  gsap.to(e.currentTarget, { y: 0, duration: 0.2, ease: 'power2.out' });
}

export default function Projects() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        once: true,
      },
      defaults: { ease: 'power2.out' },
    });

    tl.from('.projects-header', { opacity: 0, y: 30, duration: 0.6 }, 0)
      .from('.project-card', { opacity: 0, y: 40, duration: 0.6, stagger: 0.1 }, 0)
      .from('.projects-cta', { opacity: 0, y: 20, duration: 0.6 }, 0.7);
  }, { scope: containerRef });

  return (
    <section id="projects" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-background/40 to-transparent pointer-events-none" />
      <div className="max-w-6xl mx-auto" ref={containerRef}>
        {/* Section header */}
        <div className="projects-header text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-3">
            Projects
          </p>
          <h2 className="text-3xl md:text-4xl font-bold">
            Things I've <span className="gradient-text">Built</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto">
            A selection of projects from web apps to embedded firmware — each one a new challenge.
          </p>
        </div>

        {/* Projects grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {repos.map((repo) => (
            <div
              key={repo.name}
              onMouseEnter={onCardEnter}
              onMouseLeave={onCardLeave}
              className="project-card group"
            >
              <Card className="h-full flex flex-col bg-card border-border glow-border transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold text-foreground group-hover:text-violet-300 transition-colors">
                      {repo.name}
                    </CardTitle>
                    <div className="flex items-center gap-1 shrink-0">
                      {repo.homepage && (
                        <a
                          href={repo.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md text-muted-foreground hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                          title="Live site"
                        >
                          <Globe size={14} />
                        </a>
                      )}
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                        title="View on GitHub"
                      >
                        <GitBranch size={14} />
                      </a>
                    </div>
                  </div>
                  <CardDescription className="text-sm leading-relaxed">
                    {repo.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 mt-auto">
                  <div className="flex items-center justify-between">
                    {/* Language badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: repo.languageColor }}
                      />
                      <span className="text-xs text-muted-foreground font-medium">
                        {repo.language}
                      </span>
                    </div>

                    {/* Updated */}
                    <span className="text-xs text-muted-foreground/60">
                      {new Date(repo.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Live badge */}
                  {repo.homepage && (
                    <div className="mt-3">
                      <Badge
                        variant="outline"
                        className="text-[10px] border-green-500/30 text-green-400 bg-green-500/10 gap-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Live
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* View all CTA */}
        <div className="projects-cta text-center mt-12">
          <a
            href="https://github.com/domeepc?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="lg"
              className="border-violet-500/40 text-violet-300 hover:bg-violet-500/10 hover:border-violet-400 gap-2"
            >
              <ExternalLink size={16} />
              View All Repositories
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Manual visual check**

Run: `npm run dev`, scroll to Projects section.
Expected: header fades up, project cards fade+slide up staggered by 0.1s each, CTA button fades up last. Hovering a card lifts it by 6px and releases smoothly on mouse leave.

- [ ] **Step 4: Commit**

```bash
git add src/components/Projects.tsx
git commit -m "refactor: migrate Projects.tsx from framer-motion to gsap"
```

---

### Task 5: Convert Contact.tsx

**Files:**
- Modify: `src/components/Contact.tsx`

**Interfaces:**
- Consumes: `gsap`, `useGSAP` from `@/lib/gsap`.

- [ ] **Step 1: Update imports**

Replace line 1 (`import { motion } from "framer-motion";`) and line 3 (`import { useScrollAnimation } from "@/hooks/useScrollAnimation";`) with:

```tsx
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
```

- [ ] **Step 2: Replace the component body**

```tsx
export default function Contact() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        once: true,
      },
      defaults: { ease: 'power2.out' },
    });

    tl.from('.contact-header', { opacity: 0, y: 30, duration: 0.6 }, 0)
      .from('.contact-links', { opacity: 0, y: 20, duration: 0.6 }, 0.15)
      .from('.contact-footer', { opacity: 0, duration: 0.6 }, 0.3);
  }, { scope: containerRef });

  return (
    <footer id="contact" className="py-28 px-6 relative">
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-background/40 to-transparent pointer-events-none" />
      {/* Top glow */}
      <div className="absolute top-18 md:top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-linear-to-r from-transparent via-violet-500/40 to-transparent" />

      <div className="max-w-3xl mx-auto text-center" ref={containerRef}>
        {/* Header */}
        <div className="contact-header mb-12">
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-3">
            Get In Touch
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Let's <span className="gradient-text">Connect</span>
          </h2>
          <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
            I'm always open to new opportunities, collaborations, or just a
            conversation about tech and projects.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
            <MapPin size={14} className="text-violet-400" />
            {profile.location}
          </div>
        </div>

        {/* Link cards */}
        <div className="contact-links flex flex-col sm:flex-row gap-4 justify-center mb-16">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 px-6 py-4 rounded-xl bg-card border border-border hover:border-violet-500/40 glow-border transition-all duration-300 hover:-translate-y-1"
            >
              <div className="p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20 group-hover:bg-violet-500/20 transition-colors text-violet-400">
                <link.Icon />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">{link.label}</p>
                <p className="text-sm text-muted-foreground">
                  {link.description}
                </p>
              </div>
            </a>
          ))}
        </div>

        {/* Divider */}
        <Separator className="mb-8" />

        {/* Footer bottom */}
        <div className="contact-footer flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            Built with <span className="text-violet-400">Astro</span> ·{" "}
            <span className="text-violet-400">React</span> ·{" "}
            <span className="text-violet-400">Tailwind</span> ·{" "}
            <span className="text-violet-400">GSAP</span>
          </p>
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="text-foreground font-medium">{profile.name}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
```

Everything above the component (icons, `links` array, lines 8-45 of the original file) is unchanged.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Manual visual check**

Run: `npm run dev`, scroll to the footer/Contact section.
Expected: header fades up, link cards fade up, footer bottom text fades in, in sequence. Footer text now reads "GSAP" instead of "Framer Motion".

- [ ] **Step 5: Commit**

```bash
git add src/components/Contact.tsx
git commit -m "refactor: migrate Contact.tsx from framer-motion to gsap"
```

---

### Task 6: Convert Timeline.tsx

**Files:**
- Modify: `src/components/Timeline.tsx`

**Interfaces:**
- Consumes: `gsap`, `ScrollTrigger`, `useGSAP` from `@/lib/gsap`.

- [ ] **Step 1: Replace the file contents**

```tsx
// src/components/Timeline.tsx
import { useRef, useState, useEffect } from "react";
import {
  GraduationCap,
  FolderGit2,
  Sparkles,
  Globe,
} from "lucide-react";
import { timeline } from "@/lib/data";
import type { TimelineEntry } from "@/lib/data";
import { gsap, useGSAP } from "@/lib/gsap";

const typeConfig: Record<
  TimelineEntry["type"],
  { icon: React.ElementType; color: string; bg: string }
> = {
  education: {
    icon: GraduationCap,
    color: "text-violet-800",
    bg: "bg-violet-500 border-violet-800/30",
  },
  work: {
    icon: Sparkles,
    color: "text-blue-800",
    bg: "bg-blue-500 border-blue-800/30",
  },
  project: {
    icon: FolderGit2,
    color: "text-emerald-800",
    bg: "bg-emerald-500 border-emerald-800/30",
  },
};

const N = timeline.length;

function MobileTimelineCard({
  entry,
  index,
}: {
  entry: TimelineEntry;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const config = typeConfig[entry.type];
  const Icon = config.icon;

  useGSAP(() => {
    gsap.from(cardRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.5,
      delay: index * 0.05,
      ease: "power2.out",
      scrollTrigger: {
        trigger: cardRef.current,
        start: "top 85%",
        once: true,
      },
    });
  }, { scope: cardRef });

  return (
    <div ref={cardRef} className="relative flex gap-4 pl-0">
      <div className="relative z-10 shrink-0">
        <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${config.bg}`}>
          <Icon size={14} className={config.color} />
        </div>
      </div>

      <div className="flex-1 min-w-0 pb-6">
        <div className="p-4 rounded-xl bg-card border border-border hover:border-violet-500/30 transition-colors glow-border">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              {entry.website && (
                <a href={entry.website} target="_blank" rel="noopener noreferrer">
                  <Globe size={12} className="text-violet-400 shrink-0" />
                </a>
              )}
              <h3 className="font-semibold text-foreground text-sm leading-snug">
                {entry.title}
              </h3>
              <p className="text-xs text-violet-400/80 font-medium">
                {entry.institution}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {entry.current && (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Current
                </span>
              )}
              <span className="text-xs text-muted-foreground font-medium">
                {entry.year}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {entry.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function TimelineCard({
  entry,
  setRef,
}: {
  entry: TimelineEntry;
  setRef: (el: HTMLDivElement | null) => void;
}) {
  const config = typeConfig[entry.type];
  const Icon = config.icon;

  return (
    <div ref={setRef} className="relative flex gap-2 md:gap-6 pl-0 md:pl-4">
      {/* Icon node */}
      <div className="relative z-10 shrink-0">
        <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${config.bg}`}>
          <Icon size={14} className={config.color} />
        </div>
      </div>

      {/* Content card */}
      <div className="flex-1 pb-2 px-4 min-w-0">
        <div className="p-4 md:p-5 rounded-xl bg-card border border-border hover:border-violet-500/30 transition-colors glow-border">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              {entry.website && (
                <a href={entry.website} target="_blank" rel="noopener noreferrer">
                  <Globe size={13} className="text-violet-400 shrink-0" />
                </a>
              )}
              <h3 className="font-semibold text-foreground text-sm md:text-base leading-snug">
                {entry.title}
              </h3>
              <p className="text-sm text-violet-400/80 font-medium">
                {entry.institution}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {entry.current && (
                <span className="flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Current
                </span>
              )}
              <span className="text-xs text-muted-foreground font-medium">
                {entry.year}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {entry.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Timeline() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useGSAP(() => {
    if (isMobile || !sectionRef.current) return;

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;

        const scaleT = gsap.utils.clamp(0, 1, gsap.utils.mapRange(0, 0.1, 0, 1, p));
        const opacityT = gsap.utils.clamp(0, 1, gsap.utils.mapRange(0, 0.08, 0, 1, p));
        gsap.set(wrapperRef.current, {
          scale: 0.92 + 0.08 * scaleT,
          opacity: opacityT,
        });

        const lineT = gsap.utils.clamp(0, 1, gsap.utils.mapRange(0.1, 0.95, 0, 1, p));
        gsap.set(lineRef.current, { height: `${85 * lineT}%` });

        cardRefs.current.forEach((el, i) => {
          if (!el) return;
          const sliceSize = 0.85 / N;
          const start = i === 0 ? 0.08 : 0.1 + i * sliceSize;
          const end = i === 0 ? 0.1 : 0.1 + i * sliceSize + sliceSize * 0.5;
          const t = gsap.utils.clamp(0, 1, gsap.utils.mapRange(start, end, 0, 1, p));
          gsap.set(el, {
            opacity: t,
            y: 50 * (1 - t),
            scale: 0.95 + 0.05 * t,
          });
        });
      },
    });

    return () => st.kill();
  }, { scope: sectionRef, dependencies: [isMobile] });

  if (isMobile) {
    return (
      <section id="experience" className="py-16 px-6 relative overflow-x-hidden">
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-background/40 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-3">
              Journey
            </p>
            <h2 className="text-3xl font-bold mb-4">
              Education & <span className="gradient-text">Experience</span>
            </h2>
            <p className="text-muted-foreground text-base max-w-md mx-auto">
              My path from first lines of code to production deployments.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-[15px] top-0 bottom-0 w-px bg-gradient-to-b from-violet-400 via-violet-600 to-transparent" />
            <div className="space-y-0">
              {timeline.map((entry, i) => (
                <MobileTimelineCard
                  key={`${entry.year}-${entry.title}`}
                  entry={entry}
                  index={i}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div
      id="experience"
      ref={sectionRef}
      className="relative"
      style={{ minHeight: `${N * 80 + 80}vh` }}
    >
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <div ref={wrapperRef} className="w-full max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-3">
              Journey
            </p>
            <h2 className="text-4xl font-bold mb-4">
              Education & <span className="gradient-text">Experience</span>
            </h2>
            <p className="text-muted-foreground text-base max-w-md mx-auto">
              My path from first lines of code to production deployments.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-border">
              <div ref={lineRef} className="absolute top-0 left-0 w-full bg-linear-to-b from-violet-400 to-violet-700" />
            </div>

            <div className="space-y-6">
              {timeline.map((entry, i) => (
                <TimelineCard
                  key={`${entry.year}-${entry.title}`}
                  entry={entry}
                  setRef={(el) => { cardRefs.current[i] = el; }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Manual visual check**

Run: `npm run dev`, resize the browser to desktop width (>= 768px), scroll through the Experience section.
Expected: section pins (sticky) while scrolling, the vertical line grows downward, each card scales/fades/slides in as scroll progress passes its slice — same feel as before. Resize to mobile width (< 768px) and reload: each timeline card fades up individually as it's scrolled into view, staggered slightly by index.

- [ ] **Step 4: Commit**

```bash
git add src/components/Timeline.tsx
git commit -m "refactor: migrate Timeline.tsx from framer-motion to gsap"
```

---

### Task 7: Convert Hero.tsx

**Files:**
- Modify: `src/components/Hero.tsx`

**Interfaces:**
- Consumes: `gsap`, `useGSAP` from `@/lib/gsap`.

- [ ] **Step 1: Replace the file contents**

```tsx
// src/components/Hero.tsx
import { useEffect, useRef, useState } from "react";
import { scrollToHash } from "@/lib/smoothScroll";
import { ArrowDown, Code2 } from "lucide-react";
import { Button } from "./ui/button";
import { profile } from "@/lib/data";
import { gsap, useGSAP } from "@/lib/gsap";

interface Particle {
  id: number;
  size: number;
  left: string;
  top: string;
  duration: string;
  delay: string;
  depth: number;
}

function makeParticles(): Particle[] {
  return Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    duration: `${Math.random() * 4 + 4}s`,
    delay: `${Math.random() * 3}s`,
    depth: Math.random() * 0.8 + 0.2,
  }));
}

function ParticleNode({
  p,
  setRef,
}: {
  p: Particle;
  setRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={setRef}
      className="particle absolute pointer-events-none"
      style={
        {
          width: p.size,
          height: p.size,
          left: p.left,
          top: p.top,
          "--duration": p.duration,
          "--delay": p.delay,
        } as React.CSSProperties
      }
    />
  );
}

export default function Hero() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const heroRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const p = makeParticles();
    particlesRef.current = p;
    setParticles(p);
  }, []);

  useGSAP(() => {
    const applyParallax = () => {
      const { x, y } = pointer.current;
      gsap.set(glowRef.current, {
        x: `${gsap.utils.mapRange(-0.5, 0.5, -6, 6, x)}%`,
        y: `${gsap.utils.mapRange(-0.5, 0.5, -6, 6, y)}%`,
      });
      gsap.set(gridRef.current, {
        x: `${gsap.utils.mapRange(-0.5, 0.5, -2, 2, x)}%`,
        y: `${gsap.utils.mapRange(-0.5, 0.5, -2, 2, y)}%`,
      });
      particlesRef.current.forEach((p, i) => {
        const el = particleRefs.current[i];
        if (!el) return;
        gsap.set(el, {
          x: gsap.utils.mapRange(-0.5, 0.5, -p.depth * 30, p.depth * 30, x),
          y: gsap.utils.mapRange(-0.5, 0.5, -p.depth * 30, p.depth * 30, y),
        });
      });
    };

    const setX = gsap.quickTo(pointer.current, "x", {
      duration: 0.5,
      ease: "power3.out",
      onUpdate: applyParallax,
    });
    const setY = gsap.quickTo(pointer.current, "y", {
      duration: 0.5,
      ease: "power3.out",
      onUpdate: applyParallax,
    });

    const handleMouseMove = (e: MouseEvent) => {
      setX(e.clientX / window.innerWidth - 0.5);
      setY(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", handleMouseMove);

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.from(".hero-badge", { opacity: 0, y: 20, duration: 0.5 }, 0)
      .from(".hero-name", { opacity: 0, y: 30, duration: 0.6 }, 0.1)
      .from(".hero-title", { opacity: 0, y: 20, duration: 0.6 }, 0.2)
      .from(".hero-location", { opacity: 0, y: 20, duration: 0.6 }, 0.3)
      .from(".hero-cta", { opacity: 0, y: 20, duration: 0.6 }, 0.4)
      .from(".hero-scroll", { opacity: 0, duration: 0.8, ease: "power1.out" }, 1);

    gsap.to(".hero-scroll-arrow", {
      y: 6,
      duration: 0.75,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, { scope: heroRef });

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Radial glow — slow parallax */}
      <div ref={glowRef} className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-violet-900/20 blur-[120px]" />
      </div>

      {/* Floating particles — per-particle depth parallax */}
      {particles.map((p, i) => (
        <ParticleNode key={p.id} p={p} setRef={(el) => { particleRefs.current[i] = el; }} />
      ))}

      {/* Grid overlay — very subtle parallax */}
      <div
        ref={gridRef}
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(167,139,250,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(167,139,250,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="flex flex-col items-center justify-center relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-8">
          <Code2 size={14} />
          Computer Engineer & Developer
        </div>

        {/* Name */}
        <h1 className="hero-name text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Hi, I'm{" "}
          <span className="gradient-text">{profile.name.split(" ")[0]}</span>
        </h1>

        {/* Title */}
        <p className="hero-title text-xl md:text-2xl text-muted-foreground font-light mb-4">
          {profile.title}
        </p>

        {/* Location */}
        <p className="hero-location text-sm text-violet-400/70 mb-10">
          📍 {profile.location}
        </p>

        {/* CTA Buttons */}
        <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              className="bg-violet-600 hover:bg-violet-500 text-white gap-2 px-8 shadow-lg shadow-violet-900/40 transition-all duration-300 hover:shadow-violet-700/50 hover:-translate-y-0.5"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              View GitHub
            </Button>
          </a>
          <a
            href={profile.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              size="lg"
              variant="outline"
              className="border-violet-500/40 text-violet-300 hover:bg-violet-500/10 hover:border-violet-400 gap-2 px-8 transition-all duration-300 hover:-translate-y-0.5"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </Button>
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll z-10 mt-10">
          <a
            href="#about"
            onClick={(e) => { e.preventDefault(); scrollToHash('#about'); }}
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-violet-400 transition-colors"
          >
            <span className="text-xs font-medium tracking-widest uppercase">
              Scroll
            </span>
            <div className="hero-scroll-arrow">
              <ArrowDown size={16} />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Manual visual check**

Run: `npm run dev`, load the homepage.
Expected: badge, name, title, location, CTA buttons, and scroll indicator fade/slide in sequentially on load, same order/timing as before. Moving the mouse across the hero shifts the glow, grid, and floating particles with a smooth lag (particles farther "deep" move more). The scroll-down arrow bounces continuously.

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.tsx
git commit -m "refactor: migrate Hero.tsx from framer-motion to gsap"
```

---

### Task 8: Convert Navbar.tsx

**Files:**
- Modify: `src/components/Navbar.tsx`

**Interfaces:**
- Consumes: `gsap`, `useGSAP` from `@/lib/gsap`.

- [ ] **Step 1: Replace the file contents**

```tsx
// src/components/Navbar.tsx
import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { profile } from '@/lib/data';
import { scrollToHash } from '@/lib/smoothScroll';
import { gsap, useGSAP } from '@/lib/gsap';

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
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  useGSAP(() => {
    gsap.from(navRef.current, { opacity: 0, duration: 0.6, delay: 0.1, ease: 'power2.out' });
  }, []);

  useGSAP(() => {
    gsap.to(menuRef.current, {
      opacity: menuOpen ? 1 : 0,
      scale: menuOpen ? 1 : 0.97,
      duration: 0.2,
      ease: 'power2.out',
      pointerEvents: menuOpen ? 'auto' : 'none',
    });
  }, { dependencies: [menuOpen] });

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${
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
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile fullscreen overlay — always mounted, toggled via opacity/scale so fixed positioning is never affected by a CSS transform ancestor */}
      <div
        ref={menuRef}
        aria-hidden={!menuOpen}
        className="md:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-8 opacity-0 scale-[0.97] pointer-events-none"
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
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Manual visual check**

Run: `npm run dev`, load the homepage.
Expected: navbar fades in on load. Resize to mobile width, click the hamburger: fullscreen menu fades/scales in; click a link or press Escape: menu fades/scales out (no layout jump, background scroll stays locked while open).

- [ ] **Step 4: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "refactor: migrate Navbar.tsx from framer-motion to gsap"
```

---

### Task 9: Convert CustomCursor.tsx

**Files:**
- Modify: `src/components/CustomCursor.tsx`

**Interfaces:**
- Consumes: `gsap`, `useGSAP` from `@/lib/gsap`.

- [ ] **Step 1: Replace the file contents**

```tsx
// src/components/CustomCursor.tsx
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.set([dotRef.current, ringRef.current], {
      xPercent: -50,
      yPercent: -50,
      x: -100,
      y: -100,
    });

    const setDotX = gsap.quickTo(dotRef.current, "x", { duration: 0, ease: "none" });
    const setDotY = gsap.quickTo(dotRef.current, "y", { duration: 0, ease: "none" });
    const setRingX = gsap.quickTo(ringRef.current, "x", { duration: 0.35, ease: "power3.out" });
    const setRingY = gsap.quickTo(ringRef.current, "y", { duration: 0.35, ease: "power3.out" });
    const setRingScale = gsap.quickTo(ringRef.current, "scale", { duration: 0.3, ease: "power3.out" });
    const setRingOpacity = gsap.quickTo(ringRef.current, "opacity", { duration: 0.3, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      setDotX(e.clientX);
      setDotY(e.clientY);
      setRingX(e.clientX);
      setRingY(e.clientY);
    };

    const onEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a, button, [role='button'], input, textarea, select, label, [tabindex]")
      ) {
        setRingScale(2);
        setRingOpacity(0.6);
      }
    };

    const onLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a, button, [role='button'], input, textarea, select, label, [tabindex]")
      ) {
        setRingScale(1);
        setRingOpacity(1);
      }
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onEnter);
    document.addEventListener("mouseout", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout", onLeave);
    };
  }, []);

  return (
    <>
      {/* Outer ring — eased lag behind the cursor */}
      <div ref={ringRef} className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block">
        <div className="w-8 h-8 rounded-full border border-violet-400/70" />
      </div>

      {/* Inner dot — snaps instantly to cursor */}
      <div ref={dotRef} className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block">
        <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Manual visual check**

Run: `npm run dev`, load the homepage on a desktop-width viewport, move the mouse around.
Expected: small dot snaps instantly to the cursor; larger ring follows with a smooth eased lag. Hovering an interactive element (link/button) grows the ring and dims its opacity; leaving shrinks/restores it.

- [ ] **Step 4: Commit**

```bash
git add src/components/CustomCursor.tsx
git commit -m "refactor: migrate CustomCursor.tsx from framer-motion to gsap"
```

---

### Task 10: Remove framer-motion and the now-unused hook

**Files:**
- Delete: `src/hooks/useScrollAnimation.ts`
- Modify: `package.json`

**Interfaces:**
- None — this is cleanup, no new interfaces produced.

- [ ] **Step 1: Confirm no remaining references**

Run: `grep -rl "framer-motion\|useScrollAnimation" src`
Expected: no output (empty). If anything prints, stop and convert that file first — it means an earlier task missed a reference.

- [ ] **Step 2: Delete the unused hook**

```bash
rm src/hooks/useScrollAnimation.ts
```

- [ ] **Step 3: Remove the dependency**

Run: `npm uninstall framer-motion`
Expected: `package.json` `dependencies` no longer lists `framer-motion`; `package-lock.json` updates.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: succeeds with no missing-module errors.

- [ ] **Step 5: Full manual regression pass**

Run: `npm run dev`, walk through the entire page top to bottom:
- Hero: mount animation sequence, mouse parallax, scroll-arrow bounce.
- Navbar: mount fade, scroll-triggered background blur, mobile menu open/close.
- About, Skills, Projects, Contact: scroll-triggered reveals fire once each, in the same stagger order as before.
- Timeline: desktop scroll-scrub (pin, line growth, per-card reveal) and mobile per-card reveal (resize to confirm both).
- CustomCursor: dot/ring tracking and hover growth.

Expected: no console errors, no visual regressions, no `framer-motion` in the network/module graph.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: remove framer-motion, migration to gsap complete"
```

---

## Self-Review Notes

- **Spec coverage:** All 9 original framer-motion files (Hero, Navbar, CustomCursor, About, Skills, Projects, Contact, Timeline, useScrollAnimation) have a task. The fidelity note (eased approximation vs. literal spring physics) is reflected in Task 7/9's use of `quickTo` with tuned duration/ease instead of stiffness/damping.
- **Type consistency:** `gsap`, `ScrollTrigger`, `useGSAP` names are identical across every task (all imported from `@/lib/gsap`, defined once in Task 1).
- **No test framework:** every task's verification is `npm run build` + a manual `npm run dev` check, consistent with the Global Constraints section — no task invents a test command that doesn't exist in this repo.
