import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../store/settings.store';

/**
 * Haptic feedback service for providing consistent tactile feedback across the application.
 * Respects user preferences configured in Settings.
 */
class HapticService {
  /**
   * Helper to check if haptics are enabled in user settings
   */
  private isEnabled(): boolean {
    return useSettingsStore.getState().hapticsEnabled;
  }

  /**
   * Standard button or clickable card press (Light impact)
   */
  async buttonPress(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Gracefully handle web or unsupported environments
    }
  }

  /**
   * Impact vibration with specific intensity
   */
  async impact(style: 'light' | 'medium' | 'heavy' = 'light'): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      const feedbackStyle =
        style === 'heavy'
          ? Haptics.ImpactFeedbackStyle.Heavy
          : style === 'medium'
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light;

      await Haptics.impactAsync(feedbackStyle);
    } catch {}
  }

  /**
   * Successful action feedback (e.g., package added, address saved, login success)
   */
  async success(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  }

  /**
   * Warning action feedback (e.g., delete confirmation, alert trigger)
   */
  async warning(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
  }

  /**
   * Error feedback (e.g., form validation error, network failure)
   */
  async error(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {}
  }

  /**
   * Selection feedback for tabs, segmented controls, picker wheels, or switches
   */
  async selection(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.selectionAsync();
    } catch {}
  }
}

export const hapticService = new HapticService();
