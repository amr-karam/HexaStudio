interface RadialGlowProps {
  color?: string;
  size?: number;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  blur?: number;
  opacity?: number;
}

export function RadialGlow({
  color = '#D4AF37',
  size = 500,
  top,
  right,
  bottom,
  left,
  blur = 40,
  opacity = 0.35,
}: RadialGlowProps) {
  const position: Record<string, string> = {};
  if (top !== undefined) position.top = top;
  if (right !== undefined) position.right = right;
  if (bottom !== undefined) position.bottom = bottom;
  if (left !== undefined) position.left = left;

  return (
    <div
      className="absolute pointer-events-none rounded-full"
      style={{
        width: size,
        height: size,
        opacity,
        background: `radial-gradient(circle, ${color}, transparent 65%)`,
        filter: `blur(${blur}px)`,
        ...position,
      }}
    />
  );
}
