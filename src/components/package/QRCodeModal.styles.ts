import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  trackingText: {
    fontFamily: 'Courier Prime',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  subtitleText: {
    fontSize: 14,
  },
  actionContainer: {
    marginTop: 20,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  pdfButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
