import { StyleSheet, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomSheetContainer: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.90,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 20,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  dragHandleArea: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#94a3b8',
    opacity: 0.6,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  sheetHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sheetTitle: {
    fontFamily: 'Inter',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  countBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countBadgeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 14,
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },
  listContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
    gap: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontFamily: 'Inter',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  sheetFooter: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    borderTopWidth: 1,
  },
});
