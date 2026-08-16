import { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from './ThemeProvider';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export interface OfflineBannerProps {
  floating?: boolean;
}

export function OfflineBanner({ floating = true }: OfflineBannerProps) {
  const { colors } = useTheme();
  const { isOffline } = useNetworkStatus();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: isOffline ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOffline, opacity]);

  return (
    <Animated.View
      accessible
      accessibilityRole="alert"
      style={[
        styles.banner,
        !floating && styles.inline,
        { opacity, backgroundColor: colors.accent },
      ]}
    >
      <Text style={[styles.text, { color: colors.background }]}>
        You're offline — showing cached data
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  inline: {
    position: 'relative',
    top: undefined,
    left: undefined,
    right: undefined,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
