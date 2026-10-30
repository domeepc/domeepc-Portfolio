import { useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';
import { useScramble } from '@/hooks/useScramble';
import { onBooted } from '@/lib/boot';

interface Props {
  text: string;
  className?: string;
  duration?: number;
  /** Decode when scrolled into view. */
  onView?: boolean;
  /** Re-decode on pointer hover of the closest interactive ancestor. */
  onHover?: boolean;
}

export default function ScrambleText({ text, className, duration, onView = true, onHover = false }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const { output, play } = useScramble(text, { duration });

  useEffect(() => {
    if (onView && inView) return onBooted(play);
  }, [onView, inView, play]);

  useEffect(() => {
    if (!onHover) return;
    const target = ref.current?.closest('a, button') ?? ref.current;
    target?.addEventListener('mouseenter', play);
    return () => target?.removeEventListener('mouseenter', play);
  }, [onHover, play]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{output}</span>
    </span>
  );
}
