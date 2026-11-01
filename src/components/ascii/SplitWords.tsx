type Part = string | { text: string; className?: string };

interface Props {
  parts: Part[];
  as?: 'h2' | 'h3' | 'p' | 'span';
  className?: string;
}

/**
 * Text whose words rise out of masks on scroll (driven by Motion.tsx via `data-split`).
 * Screen readers get the unsplit sentence; the split copy is decorative. Styled parts
 * (e.g. an accent colour) keep their class on every word they contain.
 */
export default function SplitWords({ parts, as: Tag = 'p', className }: Props) {
  const segments = parts.map((p) => (typeof p === 'string' ? { text: p, className: undefined } : p));
  const label = segments.map((s) => s.text).join('');
  const words = segments.flatMap((s) =>
    s.text.split(/(\s+)/).filter(Boolean).map((w) => ({ w, className: s.className })),
  );

  return (
    <Tag className={className} data-split="">
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">
        {words.map(({ w, className: c }, i) =>
          /^\s+$/.test(w) ? (
            ' '
          ) : (
            <span key={i} className="split-word">
              <span className={c ? `split-inner ${c}` : 'split-inner'}>{w}</span>
            </span>
          ),
        )}
      </span>
    </Tag>
  );
}
