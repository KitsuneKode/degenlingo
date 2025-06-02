import { create } from 'zustand'

type NFTModalState = {
  isOpen: boolean
  nftType: NftType
  unitId?: number
  metadataUri?: string
  open: (nftType: NftType, unitId?: number, metadataUri?: string) => void
  close: () => void
}

export enum NftType {
  subscription,
  unit,
}
export const useNFTModal = create<NFTModalState>((set) => ({
  isOpen: false,
  nftType: NftType.subscription,
  unitId: undefined,
  metadataUri: undefined,
  open: (nftType: NftType, unitId?: number, metadataUri?: string) =>
    set({ isOpen: true, nftType, unitId, metadataUri }),
  close: () => set({ isOpen: false }),
}))
