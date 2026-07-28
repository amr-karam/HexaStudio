export interface DesignTokens {
  colors: {
    obsidian: string;
    goldAccent: string;
    surface: string;
    border: string;
    text: { white: string; neutral: string };
  };
  typography: {
    fonts: { serif: string; sans: string };
    scales: { lineHeight: number[]; letterSpacing: { sm: string; md: string } };
  };
  spacing: { baseUnit: number };
  borderRadius: { sm: number; md: number; lg: number; xl: number; full: string };
  shadows: { elevation: number[] };
  transitions: { durations: { fast: number; normal: number; slow: number }; curves: { spring: string } };
  zIndex: { layers: { above: string; below: string } };
}

export const designTokens: DesignTokens = {
  colors: {
    obsidian: '#0A0A0A',
    goldAccent: '#D4A843',
    surface: '#141414',
    border: '#1F1F1F',
    text: { white: 'white', neutral: '#E5E5E5' },
  },
  typography: {
    fonts: { serif: 'serif', sans: 'system-ui' },
    scales: { lineHeight: [1, 1.5, 1.8, 2, 2.2], letterSpacing: { sm: '0.25px', md: '0.5px' } },
  },
  spacing: { baseUnit: 4 },
  borderRadius: { sm: 4, md: 8, lg: 16, xl: 24, full: '100%' },
  shadows: { elevation: [0, 4, 8, 16] },
  transitions: { durations: { fast: 150, normal: 300, slow: 500 }, curves: { spring: 'cubic-bezier(0.43, 0.83, 0.38, 1)' } },
  zIndex: { layers: { above: '1000', below: '-1000' } },
};
