'use client'

import React from 'react'

import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'

import { Toaster } from 'sonner'
import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from '@vercel/analytics/next'
import { ExitModal } from '@/components/modals/exit-modal'
import { TokenModal } from '@/components/modals/token-modal'
import { HeartsModal } from '@/components/modals/hearts-modal'
import { PaymentModal } from '@/components/modals/payment-modal'
import { PracticeModal } from '@/components/modals/practice-modal'
export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <Toaster richColors theme="system" />
      <ExitModal />
      <HeartsModal />
      <WalletModalProvider>
        <PracticeModal />
        <PaymentModal />
        <TokenModal />
        {children}
      </WalletModalProvider>
      <Analytics />
    </ClerkProvider>
  )
}
