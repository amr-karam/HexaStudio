/**
 * StatusBadge — Pill-shaped status indicator with semantic colors.
 *
 * Gold = pending, green = success/paid, red = overdue/error.
 * Uses subtle gold glow for the gold variant.
 *
 * @module components/StatusBadge
 */

import { View, Text, type ViewStyle, type TextStyle } from 'react-native';
import { useTheme } from './ThemeProvider';

export type StatusType = 'paid' | 'pending' | 'overdue' | 'success' | 'error' | 'warning' | 'neutral';

export interface StatusBadgeProps {
  /** Status label */
  label: string;
  /** Status type — determines color */
  status: StatusType;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Show dot indicator */
  dot?: boolean;
  /** Custom style */
  style?: ViewStyle;
}

const STATUS_COLORS: Record<StatusType, string> = {
  paid: '#22C55E',
  success: '#22C55E',
  pending: '#D4AF37',
  warning: '#D4AF37',
  overdue: '#EF4444',
  error: '#EF4444',
  neutral: '#6B7280',
};

export function StatusBadge({
  label,
  status,
  size = 'md',
  dot = true,
  style,
}: StatusBadgeProps) {
  const { colors, typography, radius } = useTheme();
  const color = STATUS_COLORS[status] || colors.muted;

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: size === 'sm' ? 8 : 12,
    paddingVertical: size === 'sm' ? 4 : 6,
    borderRadius: radius.pill,
    backgroundColor: `${color}1A`,
    borderWidth: 1,
    borderColor: `${color}33`,
    ...style,
  };

  const dotStyle: ViewStyle = {
    width: size === 'sm' ? 6 : 8,
    height: size === 'sm' ? 6 : 8,
    borderRadius: radius.pill,
    backgroundColor: color,
  };

  const textStyle: TextStyle = {
    color,
    fontSize: typography.monoLabel.fontSize,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  };

  return (
    <View style={containerStyle}>
      {dot && <View style={dotStyle} />}
      <Text style={textStyle}>{label}</Text>
    </View>
  );
}
