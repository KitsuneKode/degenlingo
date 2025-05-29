import { create } from 'zustand'

type PaymentModalState = {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const usePaymentModal = create<PaymentModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
