import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  const ringX = useSpring(rawX, { stiffness: 150, damping: 20, mass: 0.5 });
  const ringY = useSpring(rawY, { stiffness: 150, damping: 20, mass: 0.5 });

  const isHovering = useRef(false);

  const rawScale = useMotionValue(1);
  const rawOpacity = useMotionValue(1);
  const ringScale = useSpring(rawScale, { stiffness: 200, damping: 25 });
  const ringOpacity = useSpring(rawOpacity, { stiffness: 200, damping: 25 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      rawX.set(e.clientX);
      rawY.set(e.clientY);
    };

    const onEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a, button, [role='button'], input, textarea, select, label, [tabindex]")
      ) {
        isHovering.current = true;
        rawScale.set(2);
        rawOpacity.set(0.6);

      }
    };

    const onLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a, button, [role='button'], input, textarea, select, label, [tabindex]")
      ) {
        isHovering.current = false;
        rawScale.set(1);
        rawOpacity.set(1);
      }
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onEnter);
    document.addEventListener("mouseout", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout", onLeave);
    };
  }, [dotX, dotY, rawX, rawY, ringScale, ringOpacity]);

  return (
    <>
      {/* Outer ring — springs behind the cursor */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          scale: ringScale,
          opacity: ringOpacity,
        }}
      >
        <div className="w-8 h-8 rounded-full border border-violet-400/70" />
      </motion.div>

      {/* Inner dot — snaps instantly to cursor */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block"
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
      </motion.div>
    </>
  );
}
