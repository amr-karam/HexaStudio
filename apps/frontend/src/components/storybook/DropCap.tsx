import { ReactNode } from "react";

export function DropCap({ children, className }: { children: ReactNode; className?: string }) {
  const text = String(children);
  if (text.length < 2) {
    return (
      <span className={className} style={{ fontFamily: "Playfair Display, serif" }}>
        {children}
      </span>
    );
  }
  const firstChar = text[0];
  const rest = text.slice(1);
  return (
    <span className={className}>
      <span
        aria-hidden="true"
        style={{
          fontFamily: "Playfair Display, serif",
          fontSize: "3rem",
          fontWeight: 400,
          lineHeight: "0.8",
          float: "left",
          marginRight: "0.1em",
          marginTop: "0.05em",
          color: "rgba(212, 175, 55, 0.85)",
          textShadow: "0 2px 8px rgba(212, 175, 55, 0.15)",
          fontStyle: "italic",
        }}
      >
        {firstChar}
      </span>
      {rest}
    </span>
  );
}
