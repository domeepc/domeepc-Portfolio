import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { skills } from '@/lib/data';

const levelColors = {
  Expert: 'border-violet-400 bg-violet-400/10 text-violet-300',
  Proficient: 'border-violet-500/50 bg-violet-500/10 text-violet-400',
  Learning: 'border-violet-700/50 bg-violet-700/10 text-violet-500',
};

const levelDot = {
  Expert: 'bg-violet-400',
  Proficient: 'bg-violet-500',
  Learning: 'bg-violet-700',
};

const categoryLabels: Record<string, string> = {
  Language: 'Languages',
  Framework: 'Frameworks & Runtimes',
  Tool: 'Tools & Platforms',
};

const categories = ['Language', 'Framework', 'Tool'] as const;

export default function Skills() {
  const { ref, isInView } = useScrollAnimation();

  return (
    <section id="skills" className="py-24 px-6 relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto" ref={ref}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-3">
            Technical Skills
          </p>
          <h2 className="text-3xl md:text-4xl font-bold">
            What I <span className="gradient-text">Work With</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto">
            From low-level C firmware to full-stack TypeScript — a look at my technical toolkit.
          </p>
        </motion.div>

        {/* Skill categories */}
        <div className="space-y-10">
          {categories.map((cat, catIdx) => {
            const catSkills = skills.filter((s) => s.category === cat);
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: catIdx * 0.15 }}
              >
                <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4">
                  {categoryLabels[cat]}
                </p>
                <div className="flex flex-wrap gap-3">
                  {catSkills.map((skill, i) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{
                        duration: 0.4,
                        delay: catIdx * 0.15 + i * 0.07,
                      }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium text-sm transition-all duration-300 cursor-default ${levelColors[skill.level]}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${levelDot[skill.level]}`} />
                      {skill.name}
                      <span className="text-[10px] opacity-60 font-normal ml-1">
                        {skill.level}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap gap-6 justify-center mt-12 text-xs text-muted-foreground"
        >
          {(['Expert', 'Proficient', 'Learning'] as const).map((level) => (
            <div key={level} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${levelDot[level]}`} />
              {level}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
