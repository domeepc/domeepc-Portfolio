import { useRef } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { profile } from '@/lib/data';
import AsciiBox from './ascii/AsciiBox';
import AsciiPortrait from './ascii/AsciiPortrait';
import SectionHeader from './ascii/SectionHeader';
import SplitWords from './ascii/SplitWords';

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

export default function About() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  return (
    <section
      ref={ref}
      tabIndex={-1}
      id="about" className="relative scroll-mt-16 border-t border-line py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeader index="01" title="about" command="cat ./about.md" />

        <div className="grid gap-16 md:grid-cols-12 md:gap-10">
          <figure data-reveal="" className="md:col-span-5">
            <AsciiBox label="portrait.jpg → ascii" className="p-4 md:p-6">
              <AsciiPortrait src={profile.avatarUrl} alt={`Portrait of ${profile.name}`} />
            </AsciiBox>
            <figcaption className="mt-4 text-[11px] uppercase tracking-[0.15em] text-dim">
              <span className="text-acid">↳</span> hover or tap to see through the characters
            </figcaption>
          </figure>

          <div className="space-y-10 md:col-span-7 md:pl-6">
            <SplitWords
              className="text-[clamp(1.25rem,2.4vw,2rem)] font-medium leading-snug"
              parts={[
                'I build things that run in a browser tab and things that run on a ',
                { text: 'race car', className: 'text-acid' },
                '. From full-stack TypeScript in production to C firmware on embedded hardware — I enjoy the whole stack, down to the last byte.',
              ]}
            />

            <div>
              <AsciiBox label="whoami" className="p-5 md:p-7">
                <dl className="grid gap-y-3 text-sm">
                  {whoami.map(([k, v]) => (
                    <div key={k} data-reveal="" className="grid grid-cols-[6ch_2ch_1fr] sm:grid-cols-[8ch_2ch_1fr]">
                      <dt className="text-dim">{k}</dt>
                      <span aria-hidden="true" className="text-faint">:</span>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </AsciiBox>
            </div>

            <pre
              data-reveal=""
              aria-hidden="true"
              className="ascii-pre hidden text-xs leading-snug text-dim sm:block"
            >
              {DIAGRAM}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
