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
