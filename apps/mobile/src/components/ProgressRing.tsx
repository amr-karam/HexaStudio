/**
 * ProgressRing — Circular progress indicator with gold stroke.
 *
 * Luxury circular progress for milestone completion and loading states.
 * Uses pure React Native Animated API (no native SVG dependency).
 *
 * @module components/ProgressRing
 */

import { View, Text, type ViewStyle } from 'react-native';
import { useTheme } from './ThemeProvider';

export interface ProgressRingProps {
  /** Progress value 0-1 */
  progress: number;
  /** Ring size */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Show percentage text */
  showText?: boolean;
  /** Accessibility label describing what the ring measures */
  accessibilityLabel?: string;
  /** Custom style */
  style?: ViewStyle;
}

export function ProgressRing({
  progress,
  size = 48,
  strokeWidth = 4,
  showText = true,
  accessibilityLabel,
  style,
}: ProgressRingProps) {
  const { colors } = useTheme();
  const percentage = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  const innerSize = size - strokeWidth * 2;

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel ?? 'Progress'}
      accessibilityValue={{ min: 0, max: 100, now: percentage }}
      style={[{ alignItems: 'center', justifyContent: 'center', width: size, height: size }, style]}
    >
      {/* Background circle */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: colors.border,
        }}
      />
      {/* Progress indicator — conic gradient simulated via clipped arc */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: colors.gold,
          borderRightColor: percentage >= 25 ? colors.gold : 'transparent',
          borderBottomColor: percentage >= 50 ? colors.gold : 'transparent',
          borderLeftColor: percentage >= 75 ? colors.gold : 'transparent',
          transform: [{ rotate: `${(percentage / 100) * 360 - 90}deg` }],
        }}
      />
      {/* Inner circle */}
      <View
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          backgroundColor: colors.obsidian,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {showText && (
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.textPrimary,
            }}
          >
            {percentage}%
          </Text>
        )}
      </View>
    </View>
  );
}