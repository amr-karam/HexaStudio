/**
 * MonoLabel — Technical label with Jets.js Mono styling.
 *
 * Used for technical data points, coordinates, version numbers.
 * All-caps uppercase with wide tracking.
 *
 * @module components/MonoLabel
 */

import { Text, type TextStyle } from 'react-native';
import { useTheme } from './ThemeProvider';

export interface MonoLabelProps {
  /** Label text */
  label: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Style override */
  style?: TextStyle;
}

export function MonoLabel({ label, size = 'md', style }: MonoLabelProps) {
  const { typography } = useTheme();

  const baseStyle = {
    ...typography.monoLabel,
    fontSize: size === 'sm' ? 10 : size === 'lg' ? 12 : typography.monoLabel.fontSize,
    color: style?.color ?? 'inherit',
  } as TextStyle;

  return <Text accessibilityRole="text" style={baseStyle}>{label}</Text>;
}