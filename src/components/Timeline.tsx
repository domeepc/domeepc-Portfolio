import { useRef, useState, useEffect } from "react";
import {
  GraduationCap,
  FolderGit2,
  Sparkles,
  Globe,
} from "lucide-react";
import { timeline } from "@/lib/data";
import type { TimelineEntry } from "@/lib/data";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

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
