import { motion, useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";
import { useEffect, useState } from "react";
import { scrollToHash } from "@/lib/smoothScroll";
import { ArrowDown, Code2 } from "lucide-react";
import { Button } from "./ui/button";
import { profile } from "@/lib/data";

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
  springX,
  springY,
}: {
  p: Particle;
  springX: MotionValue<number>;
  springY: MotionValue<number>;
}) {
  const px = useTransform(springX, [-0.5, 0.5], [`${-p.depth * 30}px`, `${p.depth * 30}px`]);
  const py = useTransform(springY, [-0.5, 0.5], [`${-p.depth * 30}px`, `${p.depth * 30}px`]);
  return (
    <motion.div
      className="particle absolute pointer-events-none"
      style={
        {
          width: p.size,
          height: p.size,
          left: p.left,
          top: p.top,
          "--duration": p.duration,
          "--delay": p.delay,
          x: px,
          y: py,
        } as React.CSSProperties
      }
    />
  );
}

export default function Hero() {
  const [particles, setParticles] = useState<Particle[]>([]);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const springX = useSpring(rawX, { stiffness: 60, damping: 20 });
  const springY = useSpring(rawY, { stiffness: 60, damping: 20 });

  const glowX = useTransform(springX, [-0.5, 0.5], ["-6%", "6%"]);
  const glowY = useTransform(springY, [-0.5, 0.5], ["-6%", "6%"]);
  const gridX = useTransform(springX, [-0.5, 0.5], ["-2%", "2%"]);
  const gridY = useTransform(springY, [-0.5, 0.5], ["-2%", "2%"]);

  useEffect(() => {
    setParticles(makeParticles());

    const handleMouseMove = (e: MouseEvent) => {
      rawX.set(e.clientX / window.innerWidth - 0.5);
      rawY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [rawX, rawY]);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-[#0a0a0f] via-[#0f0a1e] to-[#0a0a0f]" />

      {/* Radial glow — slow parallax */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ x: glowX, y: glowY }}
      >
        <div className="w-[600px] h-[600px] rounded-full bg-violet-900/20 blur-[120px]" />
      </motion.div>

      {/* Floating particles — per-particle depth parallax */}
      {particles.map((p) => (
        <ParticleNode key={p.id} p={p} springX={springX} springY={springY} />
      ))}

      {/* Grid overlay — very subtle parallax */}
      <motion.div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(167,139,250,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(167,139,250,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          x: gridX,
          y: gridY,
        }}
      />

      <div className="flex flex-col items-center justify-center relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-8"
        >
          <Code2 size={14} />
          Computer Engineer & Developer
        </motion.div>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
        >
          Hi, I'm{" "}
          <span className="gradient-text">{profile.name.split(" ")[0]}</span>
        </motion.h1>

        {/* Title */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-muted-foreground font-light mb-4"
        >
          {profile.title}
        </motion.p>

        {/* Location */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-sm text-violet-400/70 mb-10"
        >
          📍 {profile.location}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
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
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="z-10 mt-10"
        >
          <a
            href="#about"
            onClick={(e) => { e.preventDefault(); scrollToHash('#about'); }}
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-violet-400 transition-colors"
          >
            <span className="text-xs font-medium tracking-widest uppercase">
              Scroll
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowDown size={16} />
            </motion.div>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
