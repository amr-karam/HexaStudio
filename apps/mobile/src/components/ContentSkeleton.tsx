import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

interface Props {
  lines?: number;
  lineWidths?: number[];
  className?: string;
}

export function ContentSkeleton({ lines = 3, lineWidths = [90, 100, 60] }: Props) {
  const pulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  return (
    <View style={styles.container}>
      {/* Title bar */}
      <Animated.View style={[styles.bar, { width: '50%', height: 28, opacity: pulse }]} />
      <View style={{ height: 16 }} />

      {/* Body lines */}
      {Array.from({ length: lines }).map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              width: `${lineWidths[i % lineWidths.length]}%`,
              height: 12,
              marginBottom: 10,
              opacity: pulse,
            },
          ]}
        />
      ))}

      {/* Card skeleton */}
      <View style={{ height: 20 }} />
      <Animated.View
        style={[
          styles.card,
          { opacity: pulse },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  bar: { backgroundColor: '#1a1a2e', borderRadius: 4 },
  card: {
    height: 120,
    backgroundColor: '#1a1a2e',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#252540',
  },
});
