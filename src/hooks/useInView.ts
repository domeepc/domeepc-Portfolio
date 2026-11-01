import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

/** True once `ref` has been at least `amount` visible. Fires once, then disconnects. */
export function useInView(ref: RefObject<Element | null>, { amount = 0 } = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        io.disconnect();
      },
      { threshold: amount },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, amount, inView]);
  return inView;
}
