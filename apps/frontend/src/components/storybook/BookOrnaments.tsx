/**
 * Book-style decorative ornaments for the storybook homepage.
 *
 * Each ornament is a pure SVG returned as a React component.
 * They are decorative only (aria-hidden) and render inline.
 *
 * Colors use CSS variables from globals.css:
 * - --color-gold: #D4AF37 (hex)
 * - rgba() variants are constructed via opacity on fill/stroke
 */

/** Small diamond bullet for list items / sub-sections. */
export function DiamondBullet({ className }: { className?: string }) {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      className={className}
      aria-hidden="true"
      style={{ color: 'rgba(212, 175, 55, 0.6)' }}
    >
      <path
        d="M4 0.5L7.5 4L4 7.5L0.5 4L4 0.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Horizontal ornamental rule: thin gold line with a centered diamond. */
export function OrnamentalRule({ className }: { className?: string }) {
  return (
    <div
      className={className}
      role="separator"
      aria-hidden="true"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: 'rgba(212, 175, 55, 0.5)',
      }}
    >
      <span style={{ flex: 1, height: '1px', background: 'currentColor' }} />
      <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor" aria-hidden="true">
        <path d="M3 0.5L5.5 3L3 5.5L0.5 3L3 0.5Z" />
      </svg>
      <span style={{ flex: 1, height: '1px', background: 'currentColor' }} />
    </div>
  );
}

/** Double-rule divider: two thin lines with a gap — classic book chapter end. */
export function DoubleRule({ className }: { className?: string }) {
  return (
    <div
      className={className}
      role="separator"
      aria-hidden="true"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '5px',
        color: 'rgba(212, 175, 55, 0.3)',
      }}
    >
      <span style={{ width: '48px', height: '1px', background: 'currentColor' }} />
      <span style={{ width: '14px', height: '1px', background: 'currentColor' }} />
      <span style={{ width: '48px', height: '1px', background: 'currentColor' }} />
    </div>
  );
}

/** Corner flourish — top-left or top-right book chapter ornament. */
export function CornerFlourish({
  position = 'top-left',
  className,
}: {
  position?: 'top-left' | 'top-right';
  className?: string;
}) {
  const rotation = position === 'top-right' ? 90 : 0;
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      style={{
        transform: `rotate(${rotation}deg)`,
        color: 'rgba(212, 175, 55, 0.28)',
      }}
      aria-hidden="true"
    >
      {/* Curving flourish line */}
      <path
        d="M4 44 C4 20, 20 4, 44 4"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
      />
      {/* Small terminal dot */}
      <circle cx="4" cy="44" r="1.5" fill="currentColor" />
      {/* Inner accent spiral */}
      <path
        d="M10 38 C10 24, 22 14, 34 10"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

/** Full-page border frame — rendered as a pseudo-element via CSS, this is the SVG asset. */
export function PageBorderSVG({ className }: { className?: string }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        color: 'rgba(212, 175, 55, 0.1)',
      }}
    >
      {/* Outer frame */}
      <rect x="3" y="3" width="94" height="94" rx="1" fill="none" stroke="currentColor" strokeWidth="0.3" />
      {/* Inner accent */}
      <rect x="4" y="4" width="92" height="92" rx="0.5" fill="none" stroke="currentColor" strokeWidth="0.15" strokeDasharray="2 2" />
      {/* Corner accents */}
      {/* Top-left */}
      <path d="M3 10 L3 3 L10 3" stroke="currentColor" strokeWidth="0.6" fill="none" />
      {/* Top-right */}
      <path d="M90 3 L97 3 L97 10" stroke="currentColor" strokeWidth="0.6" fill="none" />
      {/* Bottom-right */}
      <path d="M97 90 L97 97 L90 97" stroke="currentColor" strokeWidth="0.6" fill="none" />
      {/* Bottom-left */}
      <path d="M10 97 L3 97 L3 90" stroke="currentColor" strokeWidth="0.6" fill="none" />
    </svg>
  );
}

/** Chapter numeral — large decorative Roman or Arabic number. */
export function ChapterNumeral({
  number,
  className,
}: {
  number: number;
  className?: string;
}) {
  const roman = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ', 'Ⅹ'][number - 1] ?? String(number);
  return (
    <span
      className={className}
      style={{
        fontFamily: '"Playfair Display", serif',
        fontSize: 'clamp(3rem, 8vw, 6rem)',
        fontWeight: 400,
        lineHeight: 1,
        color: 'rgba(212, 175, 55, 0.18)',
        display: 'block',
        letterSpacing: '-0.02em',
      }}
      aria-hidden="true"
    >
      {roman}
    </span>
  );
}
