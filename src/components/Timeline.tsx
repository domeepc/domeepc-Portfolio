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

  const sliceSize = 0.85 / N;
  const start = index === 0 ? 0.08 : 0.1 + index * sliceSize;
  const end   = index === 0 ? 0.1  : 0.1 + index * sliceSize + sliceSize * 0.5;

  const opacity = useTransform(scrollYProgress, [start, end], [0, 1]);
  const y       = useTransform(scrollYProgress, [start, end], [50, 0]);
  const scale   = useTransform(scrollYProgress, [start, end], [0.95, 1]);

  return (
    <motion.div style={{ opacity, y, scale }} className="relative flex gap-2 md:gap-6 pl-0 md:pl-4">
      {/* Icon node */}
      <div className="relative z-10 shrink-0">
        <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full border flex items-center justify-center ${config.bg}`}>
          <Icon size={10} className={config.color} />
        </div>
      </div>

      {/* Content card */}
      <div className="flex-1 min-w-0">
        <div className="p-2.5 md:p-5 rounded-xl bg-card border border-border hover:border-violet-500/30 transition-colors glow-border">
          <div className="flex flex-wrap items-start justify-between gap-1 md:gap-2 mb-1 md:mb-2">
            <div className="flex flex-wrap items-center gap-1 md:gap-2 min-w-0">
              {entry.website && (
                <a href={entry.website} target="_blank" rel="noopener noreferrer">
                  <Globe size={11} className="text-violet-400 shrink-0" />
                </a>
              )}
              <h3 className="font-semibold text-foreground text-[11px] md:text-base leading-snug">
                {entry.title}
              </h3>
              <p className="text-[10px] md:text-sm text-violet-400/80 font-medium">
                {entry.institution}
              </p>
            </div>
            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              {entry.current && (
                <span className="flex items-center gap-0.5 text-[8px] md:text-[10px] px-1.5 md:px-2 py-0.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 font-medium">
                  <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Current
                </span>
              )}
              <span className="text-[9px] md:text-xs text-muted-foreground font-medium">
                {entry.year}
              </span>
            </div>
          </div>
          <p className="text-[10px] md:text-sm text-muted-foreground leading-relaxed">
            {entry.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Timeline() {
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

  const scale      = useTransform(smoothProgress, [0, 0.1],    [0.92, 1]);
  const opacity    = useTransform(smoothProgress, [0, 0.08],   [0, 1]);
  const lineHeight = useTransform(smoothProgress, [0.1, 0.95], ["0%", "85%"]);

  return (
    // Mobile: 60vh per card. Desktop: 80vh per card.
    <div
      id="experience"
      ref={sectionRef}
      className="relative"
      style={{ minHeight: `${N * 60 + 80}vh` }}
    >
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-violet-950/10 to-transparent pointer-events-none" />

        <motion.div
          style={{ scale, opacity }}
          className="w-full max-w-3xl mx-auto px-4 md:px-6"
        >
          {/* Header */}
          <div className="text-center mb-3 md:mb-12">
            <p className="text-violet-400 text-[10px] md:text-sm font-semibold tracking-widest uppercase mb-1 md:mb-3">
              Journey
            </p>
            <h2 className="text-xl md:text-4xl font-bold">
              Education & <span className="gradient-text">Experience</span>
            </h2>
            <p className="text-muted-foreground mt-1 md:mt-4 text-[11px] md:text-base max-w-md mx-auto">
              My path from first lines of code to production deployments.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Glowing line */}
            <div className="absolute left-[12px] md:left-8 top-0 bottom-0 w-px bg-border">
              <motion.div
                className="absolute top-0 left-0 w-full bg-linear-to-b from-violet-400 to-violet-700"
                style={{ height: lineHeight }}
              />
            </div>

            <div className="space-y-2 md:space-y-6">
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
