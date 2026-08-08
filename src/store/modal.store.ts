import { create } from 'zustand';
import { SupportModalType } from '../components/common/SupportHelpModal';

interface ModalState {
  addressModalOpen: boolean;
  changePasswordModalOpen: boolean;
  supportModalOpen: boolean;
  supportModalType: SupportModalType;
  carrierModalOpen: boolean;

  openAddressModal: () => void;
  closeAddressModal: () => void;

  openChangePasswordModal: () => void;
  closeChangePasswordModal: () => void;

  openSupportModal: (type: SupportModalType) => void;
  closeSupportModal: () => void;

  openCarrierModal: () => void;
  closeCarrierModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  addressModalOpen: false,
  changePasswordModalOpen: false,
  supportModalOpen: false,
  supportModalType: 'help',
  carrierModalOpen: false,

  openAddressModal: () => set({ addressModalOpen: true }),
  closeAddressModal: () => set({ addressModalOpen: false }),

  openChangePasswordModal: () => set({ changePasswordModalOpen: true }),
  closeChangePasswordModal: () => set({ changePasswordModalOpen: false }),

  openSupportModal: (type: SupportModalType) => set({ supportModalOpen: true, supportModalType: type }),
  closeSupportModal: () => set({ supportModalOpen: false }),

  openCarrierModal: () => set({ carrierModalOpen: true }),
  closeCarrierModal: () => set({ carrierModalOpen: false }),
}));
