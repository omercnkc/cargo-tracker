import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
  },
  switchTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    borderRadius: 14,
    padding: 2,
    borderWidth: 1,
  },
  switchPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 26,
  },
  switchPillActive: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  switchText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});
