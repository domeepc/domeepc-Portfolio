import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import ScrambleText from './ScrambleText';

interface Props {
  index: string;
  title: string;
  command: string;
}

/** `// 01 ────────── ABOUT` followed by the shell command that "prints" the section. */
export default function SectionHeader({ index, title, command }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });

  return (
    <div ref={ref} className="mb-14 md:mb-20">
      <div className="flex items-center gap-4 text-xs tracking-[0.2em] text-dim">
        <span className="text-acid">// {index}</span>
        <motion.span
          aria-hidden="true"
          className="flex-1 overflow-hidden whitespace-nowrap text-faint origin-left"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.1, ease: [0.7, 0, 0.2, 1] }}
        >
          {'─'.repeat(240)}
        </motion.span>
        <span>{title}</span>
      </div>
      <h2 className="mt-6 text-[clamp(2.25rem,7vw,5.5rem)] font-extrabold uppercase leading-[0.9] tracking-tight">
        <ScrambleText text={title} duration={900} />
      </h2>
      <motion.p
        className="mt-4 text-sm text-dim"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.4 }}
      >
        <span className="text-acid">$</span> {command}
      </motion.p>
    </div>
  );
}
