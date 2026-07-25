/**
 * HEXA Studio — Haptic Feedback Utility
 *
 * Provides subtle haptic feedback for premium mobile interactions.
 * Safe fallback implementation.
 *
 * @module lib/haptics
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
let HapticsModule: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  HapticsModule = require('expo-haptics');
} catch {
  HapticsModule = null;
}

export function hapticLight(): void {
  if (HapticsModule?.impactAsync) {
    HapticsModule.impactAsync(HapticsModule.ImpactFeedbackStyle?.Light || 'light').catch(() => {});
  }
}

export function hapticMedium(): void {
  if (HapticsModule?.impactAsync) {
    HapticsModule.impactAsync(HapticsModule.ImpactFeedbackStyle?.Medium || 'medium').catch(() => {});
  }
}

export function hapticHeavy(): void {
  if (HapticsModule?.impactAsync) {
    HapticsModule.impactAsync(HapticsModule.ImpactFeedbackStyle?.Rigid || 'heavy').catch(() => {});
  }
}

export function hapticSuccess(): void {
  if (HapticsModule?.notificationAsync) {
    HapticsModule.notificationAsync(HapticsModule.NotificationFeedbackType?.Success || 'success').catch(() => {});
  }
}

export function hapticWarning(): void {
  if (HapticsModule?.notificationAsync) {
    HapticsModule.notificationAsync(HapticsModule.NotificationFeedbackType?.Warning || 'warning').catch(() => {});
  }
}

export function hapticError(): void {
  if (HapticsModule?.notificationAsync) {
    HapticsModule.notificationAsync(HapticsModule.NotificationFeedbackType?.Error || 'error').catch(() => {});
  }
}
