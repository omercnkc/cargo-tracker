import React, { useRef } from 'react';
import { View, PanResponder, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const TAB_ORDER = ['Home', 'Packages', 'AddPackage', 'Statistics', 'Profile'];

interface SwipeableTabWrapperProps {
  children: React.ReactNode;
}

export const SwipeableTabWrapper: React.FC<SwipeableTabWrapperProps> = ({ children }) => {
  const navigation = useNavigation<any>();
  const route = useRoute();

  const currentIndex = TAB_ORDER.indexOf(route.name);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        // Check if gesture is predominantly horizontal swipe (dx > 30px & dx > 1.6 * dy)
        return Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy) * 1.6;
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, vx } = gestureState;

        // Swipe Left (Sol kaydırma) -> Sonraki Sekme
        if ((dx < -50 || vx < -0.35) && currentIndex >= 0 && currentIndex < TAB_ORDER.length - 1) {
          const nextTab = TAB_ORDER[currentIndex + 1];
          navigation.navigate(nextTab);
        }
        // Swipe Right (Sağa kaydırma) -> Önceki Sekme
        else if ((dx > 50 || vx > 0.35) && currentIndex > 0) {
          const prevTab = TAB_ORDER[currentIndex - 1];
          navigation.navigate(prevTab);
        }
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SwipeableTabWrapper;
