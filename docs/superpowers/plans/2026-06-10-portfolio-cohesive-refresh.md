# Portfolio Cohesive Refresh — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve mobile flow (full experience, properly adapted) and unify the desktop into one coherent visual app by swapping typography, adding a persistent background system, standardizing section rhythm, and redesigning the Timeline for mobile.

**Architecture:** Single-page Astro site with React island components. Changes are isolated to CSS globals and individual component files — no new dependencies, no data changes, no routing changes. The Timeline gets a runtime media-query check to render two completely different layouts from one component.

**Tech Stack:** Astro 6, React 19, Tailwind CSS v4 (`@tailwindcss/vite`), Framer Motion 12, Google Fonts (Syne + Outfit).

---

## File Map

| File | What changes |
|---|---|
| `src/layouts/Layout.astro` | Google Fonts links (Syne + Outfit), ambient blob divs |
| `src/styles/globals.css` | `@theme` font vars, body font-family + dot grid, heading font rule, remove Inter link |
| `src/components/Hero.tsx` | Remove inner `bg-linear-to-br` background div |
| `src/components/Skills.tsx` | Remove `bg-gradient-to-b` overlay, `py-28`, header spacing |
| `src/components/Timeline.tsx` | Remove bg overlay, full mobile/desktop split, font + padding fixes |
| `src/components/About.tsx` | `py-28`, header spacing, gradient bridge div |
| `src/components/Projects.tsx` | `py-28`, header spacing, gradient bridge div |
| `src/components/Contact.tsx` | `py-28`, header spacing, gradient bridge div |
| `src/components/Navbar.tsx` | Mobile fullscreen overlay, scrolled state shadow/border tuning, Syne on logo |

---

## Task 1: Typography — Font Swap

**Files:**
- Modify: `src/layouts/Layout.astro`
- Modify: `src/styles/globals.css`

- [ ] **Step 1: Start dev server and verify current state**

```bash
pnpm dev
```

Open `http://localhost:4321`. Confirm Inter is rendering (check DevTools → Elements → body computed font-family shows "Inter").

- [ ] **Step 2: Replace Google Fonts link in Layout.astro**

In `src/layouts/Layout.astro`, replace the two existing `<link>` preconnect + font lines:

```astro
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
  rel="stylesheet"
/>
```

With:

```astro
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600&display=swap"
  rel="stylesheet"
/>
```

- [ ] **Step 3: Add font variables to @theme and update body + heading rules in globals.css**

In `src/styles/globals.css`, add a new `@theme` block after the `@import "tailwindcss"` line:

```css
@theme {
  --font-syne: 'Syne', system-ui, sans-serif;
  --font-outfit: 'Outfit', system-ui, sans-serif;
}
```

In the `@layer base` block, update the `body` rule:

```css
body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: var(--font-outfit), system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

Still in `@layer base`, add a heading rule after the `body` rule:

```css
h1, h2, h3, h4 {
  font-family: var(--font-syne), system-ui, sans-serif;
}
```

- [ ] **Step 4: Apply Syne to the navbar logo span**

In `src/components/Navbar.tsx`, find the logo `<span>`:

```tsx
<span className="text-sm font-semibold">{profile.handle}</span>
```

Change to:

```tsx
<span className="text-sm font-semibold font-syne">{profile.handle}</span>
```

- [ ] **Step 5: Verify in browser**

Reload `http://localhost:4321`. Check:
- Body text (About paragraph, Skills labels) uses Outfit — rounder, warmer than Inter
- All `h1`/`h2`/`h3` headings use Syne — notably the Hero "Hi, I'm Domagoj" and all section headings
- Navbar handle uses Syne
- No layout breakage or FOUT (fonts should load fast via preconnect)

- [ ] **Step 6: Commit**

```bash
git add src/layouts/Layout.astro src/styles/globals.css src/components/Navbar.tsx
git commit -m "feat: swap Inter for Syne + Outfit font pairing"
```

---

## Task 2: Background System — Dot Grid + Ambient Blobs

**Files:**
- Modify: `src/styles/globals.css`
- Modify: `src/layouts/Layout.astro`

- [ ] **Step 1: Add dot grid to body in globals.css**

In `src/styles/globals.css`, update the `body` rule (already modified in Task 1) to add the dot grid:

```css
body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: var(--font-outfit), system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  background-image: radial-gradient(rgba(167, 139, 250, 0.12) 1px, transparent 1px);
  background-size: 28px 28px;
}
```

- [ ] **Step 2: Add fixed ambient blob divs to Layout.astro**

In `src/layouts/Layout.astro`, inside `<body>` before `<CustomCursor ... />`, add:

```astro
<!-- Ambient depth blobs — fixed, full-page atmosphere -->
<div aria-hidden="true" class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
  <div class="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-violet-900/15 blur-[200px]" />
  <div class="absolute top-[40%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-950/10 blur-[180px]" />
  <div class="absolute bottom-[5%] right-[-5%] w-[400px] h-[400px] rounded-full bg-violet-900/10 blur-[160px]" />
</div>
```

- [ ] **Step 3: Ensure all sections render above z-0**

All section components use `relative` or default stacking context which already sits above `z-0`. No changes needed — verify by checking the site visually.

- [ ] **Step 4: Verify in browser**

Reload `http://localhost:4321`. Scroll through the page. Check:
- Subtle dot grid visible across all sections (very faint — if it looks too strong, reduce opacity from `0.12` to `0.08`)
- Soft violet glow visible near top-center (Hero area), mid-left, and bottom-right
- No sections show a plain solid background — the grid should show through everywhere

- [ ] **Step 5: Commit**

```bash
git add src/styles/globals.css src/layouts/Layout.astro
git commit -m "feat: add persistent dot grid + ambient blob background system"
```

---

## Task 3: Remove Per-Section Backgrounds

**Files:**
- Modify: `src/components/Hero.tsx`
- Modify: `src/components/Skills.tsx`
- Modify: `src/components/Timeline.tsx`

- [ ] **Step 1: Remove Hero background gradient div**

In `src/components/Hero.tsx`, delete this element entirely (it's the first child inside the `<section>`):

```tsx
{/* Background gradient */}
<div className="absolute inset-0 bg-linear-to-br from-[#0a0a0f] via-[#0f0a1e] to-[#0a0a0f]" />
```

The Hero's radial glow (`w-[600px] h-[600px] rounded-full bg-violet-900/20 blur-[120px]`) and grid overlay (opacity-[0.03]) remain — they are foreground decorative elements, not the background.

- [ ] **Step 2: Remove Skills section background overlay**

In `src/components/Skills.tsx`, delete this element inside the `<section>`:

```tsx
{/* Background accent */}
<div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent pointer-events-none" />
```

- [ ] **Step 3: Remove Timeline section background overlay**

In `src/components/Timeline.tsx`, inside the sticky `<div>`, delete:

```tsx
<div className="absolute inset-0 bg-linear-to-b from-transparent via-violet-950/10 to-transparent pointer-events-none" />
```

- [ ] **Step 4: Verify in browser**

Reload. Check:
- Hero: dot grid visible through the section (the Hero's own radial glow + grid overlay still present)
- Skills: dot grid visible, marquee rows unaffected
- Timeline: dot grid visible through cards
- No visual holes or jarring color breaks between sections

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.tsx src/components/Skills.tsx src/components/Timeline.tsx
git commit -m "feat: remove per-section backgrounds, let body background system show through"
```

---

## Task 4: Section Rhythm + Gradient Bridges

**Files:**
- Modify: `src/components/About.tsx`
- Modify: `src/components/Skills.tsx`
- Modify: `src/components/Projects.tsx`
- Modify: `src/components/Contact.tsx`

- [ ] **Step 1: Update About.tsx — padding, header spacing, bridge**

In `src/components/About.tsx`, make these three changes:

1. Section element: change `py-24` → `py-28` and add `relative`:
```tsx
<section id="about" className="py-28 px-6 relative">
```

2. Section header eyebrow `<p>`: change `mb-3` to `mb-3` (no change needed — already correct).
   Section header `<h2>`: ensure it has `mb-4`:
```tsx
<h2 className="text-3xl md:text-4xl font-bold mb-4">
  Who I <span className="gradient-text">Am</span>
</h2>
```
   The `motion.div` wrapper has `mb-16` — verify it's already there. If it says `mb-16`, leave it. If it doesn't, change it to `mb-16`.

3. Add gradient bridge div as first child inside `<section>`:
```tsx
<div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-background/40 to-transparent pointer-events-none" />
```

- [ ] **Step 2: Update Skills.tsx — padding, header spacing, bridge**

In `src/components/Skills.tsx`:

1. Change `py-24` → `py-28` on the `<section>`.

2. Section header motion div: ensure `mb-16` is on the wrapper div. The inner `<h2>` should have `mb-4`, and `<p>` (subtext) should be the last element in the header block.

3. Add gradient bridge as first child inside `<section>` (after removing the bg overlay in Task 3):
```tsx
<div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-background/40 to-transparent pointer-events-none" />
```

- [ ] **Step 3: Update Projects.tsx — padding, header spacing, bridge**

In `src/components/Projects.tsx`:

1. Change `py-24` → `py-28` on the `<section>`.

2. Add gradient bridge as first child inside `<section>`:
```tsx
<div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-background/40 to-transparent pointer-events-none" />
```

- [ ] **Step 4: Update Contact.tsx — padding, header spacing, bridge**

In `src/components/Contact.tsx`:

1. The `<footer>` uses `py-24` — change to `py-28`.

2. Add gradient bridge as first child inside `<footer>`:
```tsx
<div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-background/40 to-transparent pointer-events-none" />
```

- [ ] **Step 5: Verify in browser**

Scroll through the full page. Check:
- Consistent breathing room between all sections — no tight section-to-section stacking
- Subtle fade-in effect at the top of each section (the gradient bridge)
- All section headers follow the same rhythm: eyebrow → heading → subtext → content

- [ ] **Step 6: Commit**

```bash
git add src/components/About.tsx src/components/Skills.tsx src/components/Projects.tsx src/components/Contact.tsx
git commit -m "feat: standardize section rhythm and add gradient bridges"
```

---

## Task 5: Navbar Refinement

**Files:**
- Modify: `src/components/Navbar.tsx`

- [ ] **Step 1: Update scrolled state shadow and border**

In `src/components/Navbar.tsx`, find the `scrolled` conditional className on `<motion.nav>`:

```tsx
scrolled
  ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-violet-900/10'
  : 'bg-transparent'
```

Change to:

```tsx
scrolled
  ? 'bg-background/80 backdrop-blur-xl border-b border-violet-900/30 shadow-lg shadow-violet-900/20'
  : 'bg-transparent'
```

- [ ] **Step 2: Replace mobile dropdown with fullscreen overlay**

In `src/components/Navbar.tsx`, replace the entire mobile menu `AnimatePresence` block:

```tsx
{/* Mobile menu */}
<AnimatePresence>
  {menuOpen && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl"
    >
      <div className="px-6 py-4 flex flex-col gap-4">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => { handleNav(e); setMenuOpen(false); }}
            className="text-sm text-muted-foreground hover:text-violet-400 transition-colors font-medium py-1"
          >
            {link.label}
          </a>
        ))}
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

With:

```tsx
{/* Mobile fullscreen overlay */}
<AnimatePresence>
  {menuOpen && (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-8"
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
```

- [ ] **Step 3: Ensure hamburger button z-index is above overlay**

The hamburger `<button>` needs to render above the overlay when it's open (so the X button is clickable). Add `relative z-50` to the button:

```tsx
<button
  className="md:hidden relative z-50 p-2 text-muted-foreground hover:text-foreground transition-colors"
  onClick={() => setMenuOpen(!menuOpen)}
  aria-label="Toggle menu"
>
  {menuOpen ? <X size={20} /> : <Menu size={20} />}
</button>
```

The `<motion.nav>` already has `z-50`, so the nav bar and its children (including the button) sit above the overlay's `z-40`.

- [ ] **Step 4: Verify on mobile**

In browser DevTools, switch to a mobile viewport (e.g. iPhone 14, 390px wide). Check:
- Hamburger icon visible top-right
- Tapping hamburger: full screen overlays with centered nav links, smooth scale+opacity animation
- Tapping a link navigates to section and closes overlay
- X icon visible and tappable while overlay is open
- Desktop viewport (>768px): overlay code never activates, nav links show as usual

- [ ] **Step 5: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "feat: mobile fullscreen nav overlay, tune scrolled state shadow"
```

---

## Task 6: Timeline Mobile Redesign

**Files:**
- Modify: `src/components/Timeline.tsx`

- [ ] **Step 1: Add isMobile state with matchMedia**

In `src/components/Timeline.tsx`, add these imports at the top (they're already imported, just verify):

```tsx
import { useRef, useState, useEffect } from "react";
```

Add the `isMobile` state inside the `Timeline` component (before existing refs):

```tsx
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const mq = window.matchMedia('(max-width: 767px)');
  setIsMobile(mq.matches);
  const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}, []);
```

- [ ] **Step 2: Add MobileTimelineCard component**

Add this component above the existing `TimelineCard` component in `Timeline.tsx`:

```tsx
function MobileTimelineCard({
  entry,
  index,
}: {
  entry: TimelineEntry;
  index: number;
}) {
  const { ref, isInView } = useScrollAnimation();
  const config = typeConfig[entry.type];
  const Icon = config.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="relative flex gap-4 pl-0"
    >
      {/* Icon node */}
      <div className="relative z-10 shrink-0">
        <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${config.bg}`}>
          <Icon size={14} className={config.color} />
        </div>
      </div>

      {/* Content card */}
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
    </motion.div>
  );
}
```

Note: `useScrollAnimation` must be imported at the top — it already is via `import { useScrollAnimation } from "@/hooks/useScrollAnimation"`. Verify this import exists. The `Globe` icon must also be in the imports — it already is.

- [ ] **Step 3: Add mobile layout render path in Timeline component**

In the `Timeline` component's return statement, wrap the existing return with the conditional:

```tsx
export default function Timeline() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.001,
  });

  const scale      = useTransform(smoothProgress, [0, 0.1],    [0.92, 1]);
  const opacity    = useTransform(smoothProgress, [0, 0.08],   [0, 1]);
  const lineHeight = useTransform(smoothProgress, [0.1, 0.95], ["0%", "85%"]);

  // Mobile: static stacked layout
  if (isMobile) {
    return (
      <section id="experience" className="py-28 px-4 relative">
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
            {/* Static timeline line */}
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

  // Desktop: scroll-pinned cinematic layout (unchanged)
  return (
    <div
      id="experience"
      ref={sectionRef}
      className="relative"
      style={{ minHeight: `${N * 80 + 80}vh` }}
    >
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ scale, opacity }}
          className="w-full max-w-3xl mx-auto px-6"
        >
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
              <motion.div
                className="absolute top-0 left-0 w-full bg-linear-to-b from-violet-400 to-violet-700"
                style={{ height: lineHeight }}
              />
            </div>

            <div className="space-y-6">
              {timeline.map((entry, i) => (
                <TimelineCard
                  key={`${entry.year}-${entry.title}`}
                  entry={entry}
                  index={i}
                  scrollYProgress={smoothProgress}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
```

Note: The desktop `minHeight` changes from `N * 60 + 80` to `N * 80 + 80` — this was the mobile value being applied to both. Desktop was always meant to be `80vh` per card.

- [ ] **Step 4: Verify on mobile viewport**

In browser DevTools, switch to mobile (390px wide). Scroll through the Timeline section. Check:
- Section renders as normal scrolling content (not sticky)
- All cards visible with readable text (`text-sm` titles, `text-sm` descriptions)
- Timeline line visible on left edge, aligned with icons
- Cards fade in as they scroll into view
- No layout overflow or horizontal scroll

Switch back to desktop viewport (>768px). Check:
- Scroll-pinned cinematic version still works exactly as before
- Cards animate in as you scroll through the section

- [ ] **Step 5: Commit**

```bash
git add src/components/Timeline.tsx
git commit -m "feat: responsive Timeline — static stacked on mobile, cinematic scroll-pinned on desktop"
```

---

## Final Verification

- [ ] **Full-page mobile pass**

DevTools mobile viewport (390px). Scroll top to bottom. Check:
- Hero: readable, no overflow
- About: avatar + text stack cleanly
- Skills: marquee rows scroll smoothly
- Projects: 1-column grid, cards not clipped
- Timeline: stacked, readable, line + icons aligned
- Contact: centered links, footer text wraps cleanly
- Navbar: hamburger → fullscreen overlay → tap link → closes and scrolls

- [ ] **Full-page desktop pass**

Desktop viewport (1280px+). Scroll top to bottom. Check:
- Dot grid visible throughout, blobs add subtle depth
- No hard visual cuts between sections
- All sections feel like one canvas
- Typography: Syne headings, Outfit body — clear hierarchy
- Timeline: cinematic scroll-pinned version, desktop cards readable at full size

- [ ] **Final commit if any cleanup needed**

```bash
git add -p
git commit -m "fix: final polish after cohesive refresh"
```
