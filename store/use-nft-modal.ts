import { create } from 'zustand'

type NFTModalState = {
  isOpen: boolean
  nftImage: string
  nftName: string
  nftDescription?: string
  transactionSignature: string
  stage: 'preview' | 'minting' | 'result'
  open: (nftImage: string, nftName: string, nftDescription?: string) => void
  setTransactionSignature: (signature: string) => void
  setStage: (stage: 'preview' | 'minting' | 'result') => void
  close: () => void
}

export const useNFTModal = create<NFTModalState>((set) => ({
  isOpen: false,
  nftImage: '',
  nftName: '',
  nftDescription: '',
  transactionSignature: '',
  stage: 'preview',
  open: (nftImage, nftName, nftDescription) =>
    set({ isOpen: true, nftImage, nftName, nftDescription, stage: 'preview' }),
  setTransactionSignature: (transactionSignature) =>
    set({ transactionSignature }),
  setStage: (stage) => set({ stage }),
  close: () => set({ isOpen: false }),
}))
