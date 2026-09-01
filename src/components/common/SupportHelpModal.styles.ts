import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 197, 211, 0.25)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  scrollBody: {
    marginVertical: 14,
  },
  contentGroup: {
    gap: 12,
  },
  qText: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  aText: {
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 20,
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 16,
  },
  actionPillText: {
    fontFamily: 'Inter',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  footerCloseBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerCloseBtnText: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '700',
  },
});
