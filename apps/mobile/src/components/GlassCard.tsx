/**
 * GlassCard — Frosted glass surface with optional gold accent.
 *
 * Implements HEXA "Digital Artisan Glass" material:
 *   - rgba(18, 18, 20, 0.55) background
 *   - 1px solid rgba(255, 255, 255, 0.08) border
 *   - Gold border on interaction: rgba(212, 175, 55, 0.35)
 *
 * @module components/GlassCard
 */

import { useRef } from 'react';
import { Pressable, View, type ViewStyle, type ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from './ThemeProvider';
import { SPRING } from '../theme/motion';

const AnimatedView = Animated.createAnimatedComponent(View);

export interface GlassCardProps extends Omit<ViewProps, 'children' | 'style'> {
  /** Card content */
  children: React.ReactNode;
  /** Gold accent variant — featured cards, CTAs */
  goldAccent?: boolean;
  /** Pressable interaction */
  onPress?: (() => void) | null;
  /** Additional styles */
  style?: ViewStyle;
}

export function GlassCard({
  children,
  goldAccent = false,
  onPress,
  style,
  ...rest
}: GlassCardProps) {
  const { glass, radius, shadows } = useTheme();
  const pressed = useRef(useSharedValue(0)).current;

  const animatedStyle = useAnimatedStyle(() => {
    const borderOpacity = interpolate(pressed.value, [0, 1], [1, 0.3]);
    return {
      borderColor: goldAccent
        ? `rgba(212, 175, 55, ${0.35 * borderOpacity})`
        : `rgba(255, 255, 255, ${0.08 * borderOpacity})`,
      ...(onPress && {
        transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.99]) }],
        shadowOpacity: interpolate(pressed.value, [0, 1], [0, 0.2]),
      }),
    };
  });

  const cardStyle: ViewStyle = {
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: goldAccent ? glass.gold.backgroundColor : glass.standard.backgroundColor,
    borderColor: goldAccent ? glass.gold.borderColor : glass.standard.borderColor,
    ...shadows.card,
    ...style,
  };

  const pressableStyle: ViewStyle = {
    borderRadius: radius.md,
    overflow: 'hidden',
  };

  if (onPress) {
    return (
      <AnimatedView style={[pressableStyle, animatedStyle]}>
        <Pressable
          onPress={onPress}
          onPressIn={() => { pressed.value = withSpring(1, SPRING.micro); }}
          onPressOut={() => { pressed.value = withSpring(0, SPRING.micro); }}
          style={({ pressed: p }) => [cardStyle, p && { opacity: 0.8 }]}
          {...rest}
        >
          {children}
        </Pressable>
      </AnimatedView>
    );
  }

  return <AnimatedView style={[cardStyle, animatedStyle]} {...rest}>{children}</AnimatedView>;
}