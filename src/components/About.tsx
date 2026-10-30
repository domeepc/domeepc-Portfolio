import { motion } from 'framer-motion';
import { profile } from '@/lib/data';
import AsciiBox from './ascii/AsciiBox';
import AsciiPortrait from './ascii/AsciiPortrait';
import SectionHeader from './ascii/SectionHeader';

const whoami: [string, string][] = [
  ['name', profile.name],
  ['study', 'Computer Engineering @ FESB, Split'],
  ['work', 'Intern Java Developer @ Abysalto'],
  ['team', 'FESB Racing — embedded software'],
  ['loc', profile.location],
  ['repos', '11+ public on GitHub'],
];

// Columns must line up exactly: ┐├┘ sit at col 11, ┌┤└ at col 20.
const DIAGRAM = [
  '  web ─────┐        ┌───── embedded',
  '           ├─[ me ]─┤',
  '  algo ────┘        └───── video',
].join('\n');

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] as const },
};

export default function About() {
  return (
    <section id="about" className="relative scroll-mt-16 border-t border-line py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeader index="01" title="about" command="cat ./about.md" />

        <div className="grid gap-16 md:grid-cols-12 md:gap-10">
          <motion.figure {...reveal} className="md:col-span-5">
            <AsciiBox label="portrait.jpg → ascii" className="p-4 md:p-6">
              <AsciiPortrait src={profile.avatarUrl} alt={`Portrait of ${profile.name}`} />
            </AsciiBox>
            <figcaption className="mt-4 text-[11px] uppercase tracking-[0.15em] text-dim">
              <span className="text-acid">↳</span> hover or tap to see through the characters
            </figcaption>
          </motion.figure>

          <div className="space-y-10 md:col-span-7 md:pl-6">
            <motion.p
              {...reveal}
              className="text-[clamp(1.25rem,2.4vw,2rem)] font-medium leading-snug"
            >
              I build things that run in a browser tab and things that run on a
              <span className="text-acid"> race car</span>. From full-stack TypeScript in
              production to C firmware on embedded hardware — I enjoy the whole stack,
              down to the last byte.
            </motion.p>

            <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.1 }}>
              <AsciiBox label="whoami" className="p-5 md:p-7">
                <dl className="grid gap-y-3 text-sm">
                  {whoami.map(([k, v], i) => (
                    <motion.div
                      key={k}
                      className="grid grid-cols-[6ch_2ch_1fr] sm:grid-cols-[8ch_2ch_1fr]"
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.07 }}
                    >
                      <dt className="text-dim">{k}</dt>
                      <span aria-hidden="true" className="text-faint">:</span>
                      <dd>{v}</dd>
                    </motion.div>
                  ))}
                </dl>
              </AsciiBox>
            </motion.div>

            <motion.pre
              {...reveal}
              transition={{ ...reveal.transition, delay: 0.2 }}
              aria-hidden="true"
              className="ascii-pre hidden text-xs leading-snug text-dim sm:block"
            >
              {DIAGRAM}
            </motion.pre>
          </div>
        </div>
      </div>
    </section>
  );
}
