import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors, typography, glass } from '@/theme/tokens';

export function ARViewerScreen() {
  const [placed, setPlaced] = useState(false);
  const [scale, setScale] = useState(1);

  return (
    <View style={styles.container}>
      <View style={styles.viewport}>
        <Text style={styles.title}>HEXA Mobile AR Studio</Text>
        <Text style={styles.subtitle}>
          {placed ? 'Model anchored in real space' : 'Tap a flat surface to place architectural 3D model'}
        </Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setPlaced(!placed)}
        >
          <Text style={styles.buttonText}>{placed ? 'Reset Anchor' : 'Place 3D Model'}</Text>
        </TouchableOpacity>

        {placed && (
          <View style={styles.controls}>
            <TouchableOpacity style={styles.subButton} onPress={() => setScale(Math.max(0.5, scale - 0.25))}>
              <Text style={styles.buttonText}>- Scale</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.subButton} onPress={() => setScale(scale + 0.25)}>
              <Text style={styles.buttonText}>+ Scale</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.void,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  viewport: {
    width: '100%',
    height: '80%',
    backgroundColor: colors.obsidian,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.slate,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    marginBottom: 8,
    letterSpacing: typography.h2.letterSpacing,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.bodyS.fontSize,
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: typography.bodyS.letterSpacing,
  },
  actionButton: {
    backgroundColor: colors.gold,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: {
    color: colors.void,
    fontWeight: '600',
    fontSize: typography.monoLabel.fontSize,
    textTransform: 'uppercase',
    letterSpacing: typography.monoLabel.letterSpacing,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  subButton: {
    backgroundColor: glass.gold.backgroundColor,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: glass.gold.borderColor,
  },
});
