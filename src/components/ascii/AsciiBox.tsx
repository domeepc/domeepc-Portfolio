import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  label?: string;
  className?: string;
  as?: 'div' | 'article' | 'li';
}

/** Bordered box with "+" corners and an optional label set into the top edge. */
export default function AsciiBox({ children, label, className, as: Tag = 'div' }: Props) {
  return (
    <Tag className={cn('ascii-box', className)}>
      <span aria-hidden="true" className="corner tl">+</span>
      <span aria-hidden="true" className="corner tr">+</span>
      <span aria-hidden="true" className="corner bl">+</span>
      <span aria-hidden="true" className="corner br">+</span>
      {label && (
        <span className="absolute -top-[0.7em] left-4 bg-ink px-1 text-[11px] uppercase tracking-[0.2em] text-dim">
          ┤ {label} ├
        </span>
      )}
      {children}
    </Tag>
  );
}
