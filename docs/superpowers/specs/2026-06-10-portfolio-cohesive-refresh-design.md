# Portfolio Cohesive Refresh — Design Spec
_2026-06-10_

## Goal

Improve mobile flow (full experience, properly adapted) and make the desktop version feel like one coherent app rather than stitched sections. Approach B: cohesive refresh — surgical fixes plus rhythm, transitions, and font upgrade.

---

## 1. Typography

**Replace Inter with Syne + Outfit.**

- **Syne** — headings (`h1`–`h3`), navbar logo/handle, section eyebrow labels. Geometric, engineered character that fits the dark tech aesthetic.
- **Outfit** — body copy, UI labels, muted text, badges, button text. Warmer and more readable than Inter at small sizes.

**Implementation:**
- `Layout.astro`: swap the Google Fonts `<link>` to load `Syne:wght@400;600;700;800` and `Outfit:wght@300;400;500;600`.
- `globals.css`: update `font-family` on `body` to `'Outfit', system-ui, sans-serif`.
- Add a `font-syne` utility or use Tailwind's `fontFamily` config to apply Syne to headings and the navbar.
- All existing violet accent classes, `gradient-text`, and color tokens stay unchanged.

---

## 2. Background System

**A single persistent background layer on `body` — not per-section.**

### Dot grid
- CSS `radial-gradient` dot pattern at ~3% opacity, violet color (`rgba(167,139,250,0.15)`), `28px 28px` repeating.
- Applied via `background-image` on `body` or a fixed `::before` pseudo-element.

### Ambient depth blobs
- Three large blurred radial gradient circles (`position: fixed`, `pointer-events: none`, `z-index: 0`):
  - **Blob 1**: top-center, ~`600px`, violet-900/15, blur-[200px] — Hero area
  - **Blob 2**: middle-left, ~`500px`, violet-950/10, blur-[180px] — Skills/Projects area  
  - **Blob 3**: bottom-right, ~`400px`, violet-900/10, blur-[160px] — Contact area
- Fixed positioning means they stay in place as user scrolls, giving sections a sense of floating through depth.

### Section backgrounds
- All per-section `bg-background`, `bg-gradient-to-b`, and `via-violet-950/10` overlays removed or made `transparent`.
- The Hero's inner `<div className="absolute inset-0 bg-linear-to-br from-[#0a0a0f] via-[#0f0a1e] to-[#0a0a0f]" />` is removed — the body background and blobs replace it. The Hero's grid overlay (`opacity-[0.03]` grid lines) and floating particles remain as foreground decorative elements.
- Skills section's `absolute inset-0 bg-gradient-to-b` pointer-events overlay removed.
- Timeline section's `absolute inset-0 bg-linear-to-b` overlay removed.

---

## 3. Section Transitions & Vertical Rhythm

### Consistent padding
- All sections standardized to `py-28` (currently mixed `py-24`).
- Sections affected: About, Skills, Projects, Contact.

### Section header spacing standardized
Every section header follows this exact pattern:
```
eyebrow label: mb-3
heading h2: mb-4 (no change)
subtext p: mb-16 (before main content)
```
Currently varies across sections. Unify to this pattern everywhere.

### Gradient bridges
- Each section (except Hero) gets a `h-16` absolutely-positioned div at its top edge: `bg-gradient-to-b from-transparent to-transparent` with a very subtle violet midpoint — `via-violet-950/5`. Creates visual breathing room between sections.
- Implementation: add `<div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-background/50 to-transparent pointer-events-none" />` to each section's top.

### Navbar refinement
- Scrolled state shadow tuned: `shadow-violet-900/20 shadow-lg` (currently `shadow-violet-900/10`).
- Scrolled border-bottom: `border-violet-900/30` instead of `border-border/50`.

---

## 4. Timeline — Mobile Redesign

**Desktop**: No changes. Scroll-pinned sticky cinematic version stays as-is.

**Mobile** (below `md` breakpoint): Static stacked layout.

### Changes to `Timeline.tsx`
- Add `useMediaQuery('(max-width: 767px)')` hook (or use a simple `useState` + `useEffect` with `window.matchMedia`).
- On mobile: render a standard `<section>` with `py-28` padding instead of the sticky scroll-jacked container.
- Remove the `minHeight: N * 60vh` style on mobile.
- Cards use `useScrollAnimation` hook for fade-in (same pattern as About/Skills/Projects).
- The scroll-driven `scrollYProgress` animation is replaced with per-card `useScrollAnimation`.

### Mobile card fixes
- Font sizes — no more hardcoded tiny sizes. Use standard Tailwind scale:
  - Title: `text-sm` (was `text-[11px]`)
  - Institution: `text-xs` (was `text-[10px]`)  
  - Year/Current badge: `text-[10px]` (was `text-[9px]`/`text-[8px]`)
  - Description: `text-sm` (was `text-[10px]`)
- Card padding: `p-4` consistently (was `p-2.5` on mobile)
- Icon nodes: `w-8 h-8` on both mobile and desktop (was `w-6 h-6` on mobile)
- Gap between icon and card: `gap-4` consistently (was `gap-2` on mobile)
- Timeline line position: `left-[15px]` on mobile to align with `w-8` icon center

### Mobile section header
- Same heading sizes as desktop (`text-4xl`, not `text-xl`)
- `mb-12` below header before timeline (was `mb-3` on mobile)

---

## 5. Mobile Navbar Overlay

**Replace dropdown with fullscreen overlay.**

Current behavior: mobile menu animates `height: 0 → auto`, pushing page content down.

New behavior:
- Mobile menu becomes `position: fixed, inset-0, z-50` with `bg-background/95 backdrop-blur-2xl`.
- Nav links centered vertically and horizontally (`flex flex-col items-center justify-center gap-8`).
- Links use larger text: `text-2xl font-semibold` (Syne).
- Close button (X) in top-right corner.
- Framer Motion: `opacity: 0→1` + `scale: 0.95→1` transition (not height).
- Closes on link tap (already implemented, just needs the handler).
- `AnimatePresence` wrapper stays, transition updated.

---

## 6. Files to Change

| File | Changes |
|---|---|
| `src/layouts/Layout.astro` | Font links (Syne + Outfit) |
| `src/styles/globals.css` | font-family, dot grid background, ambient blobs, remove per-section bg helpers |
| `src/components/Navbar.tsx` | Mobile overlay menu, scrolled state shadow/border tuning, Syne font on logo |
| `src/components/Hero.tsx` | Remove background gradient (replaced by body bg system) |
| `src/components/About.tsx` | py-28, section header spacing |
| `src/components/Skills.tsx` | py-28, remove bg overlay, section header spacing |
| `src/components/Projects.tsx` | py-28, section header spacing |
| `src/components/Timeline.tsx` | Mobile/desktop layout split, mobile font fixes, mobile card padding |
| `src/components/Contact.tsx` | py-28, section header spacing |

---

## Out of Scope

- No changes to data (`lib/data.ts`)
- No changes to scroll animation logic (`hooks/useScrollAnimation.ts`, `lib/smoothScroll.ts`)
- No changes to the Projects grid layout or card design
- No changes to the Skills marquee
- No new sections or content
- No changes to the custom cursor
