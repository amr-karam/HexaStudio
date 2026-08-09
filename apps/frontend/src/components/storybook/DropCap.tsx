import { ReactNode } from 'react';

/**
 * DropCap — storybook-style enlarged first letter.
 *
 * The first character of the paragraph is rendered large and decorative
 * (Playfair Display, gold tint), while the remaining text flows normally.
 * A subtle drop shadow gives it depth like a printed book.
 */
export function DropCap({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  // Extract the first character and the rest
  const text = String(children);
  if (text.length < 2) {
    return (
      <span className={`drop-cap-lg ${className ?? ''}`}>
        {children}
      </span>
    );
  }

  const firstChar = text[0];
  const rest = text.slice(1);

  return (
    <span className={className ?? ''}>
      <span className="drop-cap-first" aria-hidden="true">
        {firstChar}
      </span>
      {rest}
    </span>
  );
}
