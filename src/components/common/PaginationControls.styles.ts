import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 2,
    marginBottom: 0,
  },
  paginationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  paginationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  paginationBtnDisabled: {
    opacity: 0.35,
  },
  paginationBtnText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  paginationPagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  paginationPagePill: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 6,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  paginationPagePillText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  paginationInfoText: {
    fontSize: 11,
    fontFamily: 'Inter',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 0,
  },
});
