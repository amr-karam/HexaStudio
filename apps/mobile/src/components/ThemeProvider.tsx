/**
 * HEXA Studio — Premium Theme Provider
 *
 * Exposes the full luxury design token system (colors, typography, spacing,
 * motion, shadows, glass) to every component via React Context.
 *
 * Design source: 07-DESIGN/DESIGN_SYSTEM.md, COLORS.md, TYPOGRAPHY.md
 * Motion source: 06-STANDARDS/MOTION_SYSTEM.md
 *
 * @module components/ThemeProvider
 */

import { createContext, useContext, type ReactNode } from 'react';
import { theme, type Theme } from '../theme/tokens';

const ThemeContext = createContext<Theme>(theme);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

/** Full theme: colors, typography, spacing, motion, shadows, glass */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}

/** Color token shortcut — the most frequently used subset */
export function useColors() {
  return useContext(ThemeContext).colors;
}
