import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { skills } from '@/lib/data';
import type { Skill } from '@/lib/data';

const levelColors = {
  Expert:     'border-violet-400 bg-violet-400/10 text-violet-300',
  Proficient: 'border-violet-500/50 bg-violet-500/10 text-violet-400',
  Learning:   'border-violet-700/50 bg-violet-700/10 text-violet-500',
};

const levelDot = {
  Expert:     'bg-violet-400',
  Proficient: 'bg-violet-500',
  Learning:   'bg-violet-700',
};

function SkillPill({ skill }: { skill: Skill }) {
  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 mx-2 rounded-lg border font-medium text-sm cursor-default shrink-0 ${levelColors[skill.level]}`}
    >
      <span className={`w-2 h-2 rounded-full ${levelDot[skill.level]}`} />
      {skill.name}
      <span className="text-[10px] opacity-60 font-normal ml-1">{skill.level}</span>
    </div>
  );
}

function MarqueeRow({
  items,
  direction,
  speed,
  label,
}: {
  items: Skill[];
  direction: 'left' | 'right';
  speed: number;
  label: string;
}) {
  // Repeat until we have at least 10 items per half so the track always
  // overflows the viewport regardless of how few items the row has.
  const minCount = 10;
  const copies = Math.ceil(minCount / items.length);
  const filled = Array.from({ length: copies }, () => items).flat();
  // Duplicate the filled list so the seamless loop always has two identical halves.
  const doubled = [...filled, ...filled];

  return (
    <div>
      <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3 px-1">
        {label}
      </p>
      {/* Fade edges */}
      <div
        className="overflow-hidden relative"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}
      >
        <div
          className="marquee-track flex w-max"
          style={{
            animationName: 'marquee-scroll',
            animationDuration: `${speed}s`,
            animationDirection: direction === 'right' ? 'reverse' : 'normal',
          }}
        >
          {doubled.map((skill, i) => (
            <SkillPill key={`${skill.name}-${i}`} skill={skill} />
          ))}
        </div>
      </div>
    </div>
  );
}

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
