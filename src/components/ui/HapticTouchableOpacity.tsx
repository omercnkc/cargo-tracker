import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  GestureResponderEvent,
} from 'react-native';
import { hapticService } from '../../services/haptics.service';

export interface HapticTouchableOpacityProps extends TouchableOpacityProps {
  /**
   * Feedback style: 'light' (default) | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error' | 'none'
   */
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error' | 'none';
}

/**
 * Clean & DRY wrapper around TouchableOpacity that automatically triggers haptic feedback on press.
 */
export const HapticTouchableOpacity: React.FC<HapticTouchableOpacityProps> = ({
  onPress,
  hapticFeedback = 'light',
  children,
  ...restProps
}) => {
  const handlePress = (event: GestureResponderEvent) => {
    if (hapticFeedback !== 'none') {
      switch (hapticFeedback) {
        case 'light':
          hapticService.buttonPress();
          break;
        case 'medium':
        case 'heavy':
          hapticService.impact(hapticFeedback);
          break;
        case 'selection':
          hapticService.selection();
          break;
        case 'success':
          hapticService.success();
          break;
        case 'warning':
          hapticService.warning();
          break;
        case 'error':
          hapticService.error();
          break;
      }
    }

    if (onPress) {
      onPress(event);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} {...restProps}>
      {children}
    </TouchableOpacity>
  );
};
