/**
 * SectionHeader — Architectural screen header with gold divider.
 *
 * Uses the HEXA type scale:
 *   - Kicker: mono uppercase label
 *   - Title: H1 weight, tight tracking
 *   - Subtitle: body secondary
 *
 * @module components/SectionHeader
 */

import { View, Text, type ViewStyle } from 'react-native';
import { useTheme } from './ThemeProvider';

export interface SectionHeaderProps {
  /** Small mono label above the title */
  kicker?: string;
  /** Main heading */
  title: string;
  /** Subtitle text */
  subtitle?: string;
  /** Right side action (e.g., "See All" link) */
  action?: string;
  /** onPress for action */
  onAction?: () => void;
  /** Custom style */
  style?: ViewStyle;
}

export function SectionHeader({
  kicker,
  title,
  subtitle,
  action,
  onAction,
  style,
}: SectionHeaderProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={[
      {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.md,
        ...style,
      },
    ]}>
      {kicker && (
        <Text style={{
          ...typography.monoLabel,
          color: colors.gold,
          marginBottom: spacing.xs,
        }}>
          {kicker}
        </Text>
      )}
      <Text style={{
        ...typography.h1,
        color: colors.textPrimary,
      }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{
          ...typography.bodyS,
          color: colors.muted,
          marginTop: spacing.xs,
          maxWidth: '80%',
        }}>
          {subtitle}
        </Text>
      )}
      {action && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm }}>
          <Text
            onPress={onAction}
            accessibilityRole="button"
            accessibilityLabel={action}
            style={{
              color: colors.gold,
              fontSize: typography.monoLabel.fontSize,
              fontWeight: '600',
              letterSpacing: 0.8,
            }}
          >
            {action}
          </Text>
        </View>
      )}
      {/* Gold divider */}
      <View style={{
        width: 32,
        height: 2,
        backgroundColor: colors.gold,
        marginTop: spacing.md,
      }} />
    </View>
  );
}
