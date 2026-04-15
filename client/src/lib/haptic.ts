/**
 * Haptic feedback utility — UX #9
 * Wraps @capacitor/haptics with web fallback (vibration API or no-op)
 */

type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

async function triggerNativeHaptic(style: HapticStyle): Promise<void> {
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');
    if (style === 'success') {
      await Haptics.notification({ type: NotificationType.Success });
    } else if (style === 'warning') {
      await Haptics.notification({ type: NotificationType.Warning });
    } else if (style === 'error') {
      await Haptics.notification({ type: NotificationType.Error });
    } else {
      const impactStyle =
        style === 'heavy' ? ImpactStyle.Heavy
        : style === 'medium' ? ImpactStyle.Medium
        : ImpactStyle.Light;
      await Haptics.impact({ style: impactStyle });
    }
  } catch {
    // Not available on web — try Web Vibration API as fallback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const duration =
        style === 'heavy' || style === 'success' ? 80
        : style === 'medium' || style === 'warning' ? 50
        : 30;
      navigator.vibrate(duration);
    }
  }
}

export const haptic = {
  light: () => triggerNativeHaptic('light'),
  medium: () => triggerNativeHaptic('medium'),
  heavy: () => triggerNativeHaptic('heavy'),
  success: () => triggerNativeHaptic('success'),
  warning: () => triggerNativeHaptic('warning'),
  error: () => triggerNativeHaptic('error'),
};
