import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.set([dotRef.current, ringRef.current], {
      xPercent: -50,
      yPercent: -50,
      x: -100,
      y: -100,
    });

    const setDotX = gsap.quickTo(dotRef.current, "x", { duration: 0, ease: "none" });
    const setDotY = gsap.quickTo(dotRef.current, "y", { duration: 0, ease: "none" });
    const setRingX = gsap.quickTo(ringRef.current, "x", { duration: 0.35, ease: "power3.out" });
    const setRingY = gsap.quickTo(ringRef.current, "y", { duration: 0.35, ease: "power3.out" });
    const setRingScale = gsap.quickTo(ringRef.current, "scale", { duration: 0.3, ease: "power3.out" });
    const setRingOpacity = gsap.quickTo(ringRef.current, "opacity", { duration: 0.3, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      setDotX(e.clientX);
      setDotY(e.clientY);
      setRingX(e.clientX);
      setRingY(e.clientY);
    };

    const onEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a, button, [role='button'], input, textarea, select, label, [tabindex]")
      ) {
        setRingScale(2);
        setRingOpacity(0.6);
      }
    };

    const onLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a, button, [role='button'], input, textarea, select, label, [tabindex]")
      ) {
        setRingScale(1);
        setRingOpacity(1);
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
  }, []);

  return (
    <>
      {/* Outer ring — eased lag behind the cursor */}
      <div ref={ringRef} className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block">
        <div className="w-8 h-8 rounded-full border border-violet-400/70" />
      </div>

      {/* Inner dot — snaps instantly to cursor */}
      <div ref={dotRef} className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block">
        <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
      </div>
    </>
  );
}
