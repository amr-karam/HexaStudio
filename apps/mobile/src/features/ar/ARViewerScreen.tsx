import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

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
    backgroundColor: '#050505',
    justifyContent: 'center',
    alignItem: 'center',
    padding: 16,
  },
  viewport: {
    width: '100%',
    height: '80%',
    backgroundColor: '#111',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '300',
    marginBottom: 8,
    fontFamily: 'System',
  },
  subtitle: {
    color: '#A1A1AA',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  actionButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: '#050505',
    fontWeight: '600',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  subButton: {
    backgroundColor: '#27272A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
