/**
 * HEXA Studio — Haptic Feedback Utility
 *
 * Provides subtle haptic feedback for premium interactions.
 * Usesexpo-haptics when available, no-op gracefully otherwise.
 *
 * @module lib/haptics
 */

import * as Haptics from 'expo-haptics';

const isEnabled = true;

/** Light tap — selection, card tap */
export function hapticLight(): void {
  if (!isEnabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/** Medium tap — button press, toggle */
export function hapticMedium(): void {
  if (!isEnabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

/** Heavy tap — destructive action confirmation */
export function hapticHeavy(): void {
  if (!isEnabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid).catch(() => {});
}

/** Success notification — login success, approval submitted */
export function hapticSuccess(): void {
  if (!isEnabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

/** Warning notification — validation error */
export function hapticWarning(): void {
  if (!isEnabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}

/** Error notification — network failure */
export function hapticError(): void {
  if (!isEnabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
}
