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
    width: '82%',
    maxWidth: 320,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 24,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  topBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  closeBtn: {
    padding: 4,
  },
  userProfileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    fontFamily: 'Inter',
  },
  menuScrollContent: {
    gap: 12,
    paddingBottom: 24,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  menuDivider: {
    height: 1,
    opacity: 0.4,
    marginVertical: 8,
  },
  personalInfoCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    marginTop: -4,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter',
    marginTop: 1,
  },
  logoutPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  logoutPillText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});
