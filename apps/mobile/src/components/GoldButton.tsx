/**
 * GoldButton — The signature HEXA CTA.
 *
 * Solid gold surface with deep-gold pressed state, subtle gold glow on press,
 * and spring-physics press animation. The label uses tight tracking for
 * architectural precision.
 *
 * @module components/GoldButton
 */

import { useRef } from 'react';
import { Pressable, Text, type PressableProps, type TextStyle, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  type SharedValue,
} from 'react-native-reanimated';
import { useTheme } from './ThemeProvider';
import { SPRING } from '../theme/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface GoldButtonProps extends Omit<PressableProps, 'children'> {
  /** Button label */
  label: string;
  /** Visual variant */
  variant?: 'solid' | 'ghost' | 'outline';
  /** Size */
  size?: 'md' | 'lg';
  /** Leading icon name (Ionicons) — optional */
  leftIcon?: string;
  /** Disabled state */
  disabled?: boolean;
}

export function GoldButton({
  label,
  variant = 'solid',
  size = 'lg',
  disabled = false,
  onPressIn,
  onPressOut,
  style,
  ...rest
}: GoldButtonProps) {
  const { colors, typography, radius, shadows } = useTheme();
  const pressed = useRef<SharedValue<number>>(useSharedValue(0)).current;

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, 0.97]);
    const glow = interpolate(pressed.value, [0, 1], [0, 0.5]);
    return {
      transform: [{ scale: withSpring(scale, SPRING.micro) }],
      shadowOpacity: withSpring(glow, SPRING.micro),
    };
  });

  const isSolid = variant === 'solid';
  const isLarge = size === 'lg';

  const buttonStyle: ViewStyle = {
    borderRadius: radius.sm,
    paddingVertical: isLarge ? 16 : 12,
    paddingHorizontal: isLarge ? 28 : 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    opacity: disabled ? 0.4 : 1,
    ...(isSolid
      ? {
          backgroundColor: colors.gold,
          ...shadows.goldGlow,
        }
      : variant === 'outline'
        ? {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.gold,
          }
        : {
            backgroundColor: 'transparent',
          }),
  };

  const labelStyle: TextStyle = {
    color: isSolid ? colors.void : colors.gold,
    fontSize: typography.bodyS.fontSize,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  };

  return (
    <AnimatedPressable
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      onPressIn={(e) => {
        pressed.value = 1;
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressed.value = 0;
        onPressOut?.(e);
      }}
      style={[buttonStyle, animatedStyle, style]}
      {...rest}
    >
      <Text style={labelStyle}>{label}</Text>
    </AnimatedPressable>
  );
}
