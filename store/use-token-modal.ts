import { create } from 'zustand'

type TokenModalState = {
  isOpen: boolean
  tokenAmount: number

  open: (tokenAmount: number) => void
  close: () => void
}

export const useTokenModal = create<TokenModalState>((set) => ({
  isOpen: false,
  tokenAmount: 0,
  open: (tokenAmount) => set({ isOpen: true, tokenAmount }),
  close: () => set({ isOpen: false }),
}))
