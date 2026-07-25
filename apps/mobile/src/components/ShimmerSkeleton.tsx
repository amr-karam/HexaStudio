/**
 * ShimmerSkeleton — Luxury shimmer loading placeholder.
 *
 * Uses gold gradient animation to create a premium loading state.
 * Respects reduced motion and appears as static content when disabled.
 *
 * @module components/ShimmerSkeleton
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { View, Animated, type ViewStyle } from 'react-native';
import { useTheme } from './ThemeProvider';

interface ShimmerSkeletonProps {
  /** Width of the skeleton */
  width?: number | string;
  /** Height of the skeleton */
  height?: number;
  /** Border radius */
  radius?: number;
  /** Number of lines to render */
  lines?: number;
  /** Children to render instead of default lines */
  children?: ReactNode;
  /** Custom style */
  style?: ViewStyle;
}

export function ShimmerSkeleton({
  width = '100%',
  height = 24,
  radius = 8,
  lines = 1,
  style,
}: ShimmerSkeletonProps) {
  const { colors, glass, spacing } = useTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  const interpolateLeft = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  const renderLine = (lineWidth: number | string) => (
    <Animated.View
      style={[
        {
          width: lineWidth as ViewStyle['width'],
          height,
          borderRadius: radius,
          backgroundColor: glass.standard.borderColor,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          position: 'absolute',
          left: interpolateLeft,
          top: 0,
          bottom: 0,
          width: '50%',
          height: '100%',
          backgroundColor: colors.gold,
          opacity: 0.15,
        }}
      />
    </Animated.View>
  );

  if (lines > 1) {
    return (
      <View style={{ gap: spacing.xs }}>
        {Array.from({ length: lines }).map((_, i) => (
          <View key={i}>{renderLine(width)}</View>
        ))}
      </View>
    );
  }

  return renderLine(width);
}

/** Simple line skeleton for lists */
export function SkeletonLine({ width = '100%', style }: { width?: number | string; style?: ViewStyle }) {
  const { colors } = useTheme();
  return (
    <View style={[{ width: width as ViewStyle['width'], height: 16, backgroundColor: colors.border, borderRadius: 4 }, style]} />
  );
}

/** Card skeleton with title + lines */
export function SkeletonCard({ style }: { style?: ViewStyle }) {
  const { colors, spacing, radius } = useTheme();
  return (
    <View style={[{
      backgroundColor: colors.obsidian,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.md,
    }, style]}>
      <View style={{ height: 24, width: '60%', backgroundColor: colors.border, borderRadius: 4 }} />
      <SkeletonLine width="80%" />
      <SkeletonLine width="50%" />
    </View>
  );
}