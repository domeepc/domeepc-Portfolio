import SplitWords from './SplitWords';

interface Props {
  index: string;
  title: string;
  command: string;
}

/** `// 01 ────────── ABOUT` followed by the shell command that "prints" the section. */
export default function SectionHeader({ index, title, command }: Props) {
  return (
    <div className="mb-14 md:mb-20">
      <div className="flex items-center gap-4 text-xs tracking-[0.2em] text-dim">
        <span className="text-acid">// {index}</span>
        <span
          aria-hidden="true"
          data-draw=""
          className="flex-1 overflow-hidden whitespace-nowrap text-faint"
        >
          {'─'.repeat(240)}
        </span>
        <span className="uppercase">{title}</span>
      </div>
      <SplitWords
        as="h2"
        parts={[title]}
        className="mt-6 text-[clamp(2.25rem,7vw,5.5rem)] font-extrabold uppercase leading-[0.9] tracking-tight"
      />
      <p data-reveal="" className="mt-4 text-sm text-dim">
        <span className="text-acid">$</span> {command}
      </p>
    </div>
  );
}
