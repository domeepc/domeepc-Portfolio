import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";
import { useRef } from "react";
import {
  GraduationCap,
  FolderGit2,
  Sparkles,
  Globe,
} from "lucide-react";
import { timeline } from "@/lib/data";
import type { TimelineEntry } from "@/lib/data";

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

function TimelineCard({
  entry,
  index,
  scrollYProgress,
}: {
  entry: TimelineEntry;
  index: number;
  scrollYProgress: MotionValue<number>;
}) {
  const config = typeConfig[entry.type];
  const Icon = config.icon;

  // Card 0 is already visible when the line starts drawing (at 0.1).
  // Cards 1..N-1 each reveal during their own scroll slice.
  const sliceSize = 0.85 / N;
  const start = index === 0 ? 0.08 : 0.1 + index * sliceSize;
  const end = index === 0 ? 0.1 : 0.1 + index * sliceSize + sliceSize * 0.5;

  const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);
  const y = useTransform(scrollYProgress, [start, end], [50, 0]);
  const scale = useTransform(scrollYProgress, [start, end], [0.95, 1]);

  return (
    <motion.div
      style={{ opacity, y, scale }}
      className="relative flex gap-6 pl-4"
    >
      {/* Icon node */}
      <div className="relative z-10 shrink-0">
        <div
          className={`w-8 h-8 rounded-full border flex items-center justify-center z-10 ${config.bg}`}
        >
          <Icon size={14} className={config.color} />
        </div>
      </div>

      {/* Content card */}
      <div className="flex-1 pb-2">
        <div className="p-5 rounded-xl bg-card border border-border hover:border-violet-500/30 transition-colors glow-border">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              {entry.website && (
                <a
                  href={entry.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe size={14} className="text-violet-400" />
                </a>
              )}
              <h3 className="font-semibold text-foreground text-base">
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
    </motion.div>
  );
}

export default function Timeline() {
  // Outer ref drives the scroll progress — tall enough so each card gets its own scroll segment
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.001,
  });

  // Entry animation: section zooms forward as it enters (first 10% of scroll)
  const scale = useTransform(smoothProgress, [0, 0.1], [0.92, 1]);
  const opacity = useTransform(smoothProgress, [0, 0.08], [0, 1]);

  // Progressive line: grows from "0%" to "100%" as scroll goes from 10% to 95%
  const lineHeight = useTransform(smoothProgress, [0.1, 0.95], ["0%", "100%"]);

  return (
    // Outer: tall scroll canvas — 80vh per card gives a snappier pace
    <div
      id="experience"
      ref={sectionRef}
      style={{ minHeight: `${N * 80 + 100}vh` }}
      className="relative"
    >
      {/* Sticky inner: pins to viewport while outer scrolls */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-violet-950/10 to-transparent pointer-events-none" />

        <motion.div
          style={{ scale, opacity }}
          className="w-full max-w-3xl mx-auto px-6"
        >
          {/* Section header */}
          <div className="text-center mb-12">
            <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-3">
              Journey
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">
              Education & <span className="gradient-text">Experience</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-md mx-auto">
              My path from first lines of code to production deployments.
            </p>
          </div>

          {/* Timeline list */}
          <div className="relative">
            {/* Progressive vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-border">
              <motion.div
                className="absolute top-0 left-0 w-full bg-linear-to-b from-violet-500 to-violet-800"
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
