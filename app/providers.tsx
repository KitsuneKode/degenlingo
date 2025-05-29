'use client'

import React, { useMemo } from 'react'
import { clusterApiUrl } from '@solana/web3.js'
import '@solana/wallet-adapter-react-ui/styles.css'
// import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";

// Default styles that can be overridden by your app
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets'

import { Toaster } from 'sonner'
import { ClerkProvider } from '@clerk/nextjs'
import { ExitModal } from '@/components/modals/exit-modal'
import { HeartsModal } from '@/components/modals/hearts-modal'
import { PaymentModal } from '@/components/modals/payment-modal'
import { PracticeModal } from '@/components/modals/practice-modal'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const network = WalletAdapterNetwork.Devnet
  const endpoint = useMemo(() => clusterApiUrl(network), [network])
  const wallets = useMemo(
    () => [
      // manually add any legacy wallet adapters here
      // new UnsafeBurnerWalletAdapter(),
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    [network],
  )

  return (
    <ClerkProvider afterSignOutUrl="/">
      <Toaster richColors theme="system" />
      <ExitModal />
      <HeartsModal />
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <PracticeModal />
            <PaymentModal />

            {children}
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ClerkProvider>
  )
}
