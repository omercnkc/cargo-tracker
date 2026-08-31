import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 28, 48, 0.4)',
  },
  drawerContainer: {
    width: '64%',
    maxWidth: 236,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 24,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  topBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  closeBtn: {
    padding: 4,
  },
  userProfileSection: {
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 6,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 11,
    fontFamily: 'Inter',
  },
  menuScrollContent: {
    gap: 8,
    paddingBottom: 20,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 6,
    marginBottom: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    gap: 10,
  },
  menuItemText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  menuDivider: {
    height: 1,
    opacity: 0.4,
    marginVertical: 6,
  },
  personalInfoCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    gap: 8,
    marginTop: -2,
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
    marginTop: 1,
  },
  logoutPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  logoutPillText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});
