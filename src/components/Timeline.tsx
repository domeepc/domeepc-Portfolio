import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import {
  GraduationCap,
  FolderGit2,
  Sparkles,
  Building2,
  Globe,
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
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

export default function Timeline() {
  const { ref, isInView } = useScrollAnimation();

  return (
    <section id="experience" className="py-24 px-6 relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-violet-950/10 to-transparent pointer-events-none" />

      <div className="max-w-3xl mx-auto" ref={ref}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-3">
            Journey
          </p>
          <h2 className="text-3xl md:text-4xl font-bold">
            Education & <span className="gradient-text">Experience</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto">
            My path from first lines of code to production deployments.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Animated vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-border">
            <motion.div
              className="absolute top-0 left-0 w-full bg-linear-to-b -z-12 from-violet-500 to-violet-800"
              initial={{ height: 0 }}
              animate={isInView ? { height: "100%" } : { height: 0 }}
              transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
            />
          </div>

          <div className="space-y-8">
            {timeline.map((entry, i) => {
              const config = typeConfig[entry.type];
              const Icon = config.icon;

              return (
                <motion.div
                  key={`${entry.year}-${entry.title}`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
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
                      {/* Header row */}
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
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
