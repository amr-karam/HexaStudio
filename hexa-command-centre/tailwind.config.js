/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: "#050505",
          light: "#0a0a0f",
          lighter: "#111118",
        },
        glass: {
          DEFAULT: "rgba(255,255,255,0.04)",
          border: "rgba(255,255,255,0.08)",
          strong: "rgba(255,255,255,0.08)",
        },
        brand: {
          cyan: "#00f0ff",
          gold: "#e8b84d",
          red: "#e85d5d",
        },
        border: "rgba(255,255,255,0.08)",
        ring: "rgba(255,255,255,0.12)",
        background: "#050505",
        foreground: "#f0f0f5",
        muted: "rgba(255,255,255,0.35)",
        card: "rgba(255,255,255,0.03)",
        cardBorder: "rgba(255,255,255,0.06)",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        body: ["'Space Grotesk'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        "glow-cyan": "0 0 30px rgba(0,240,255,0.15), 0 0 80px rgba(0,240,255,0.05)",
        "glow-gold": "0 0 30px rgba(232,184,77,0.15), 0 0 80px rgba(232,184,77,0.05)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
