'use client'
import Image from 'next/image'
import { WalletButton } from '@/components/wallet-button'

import { useWallet } from '@solana/wallet-adapter-react'

export const Wallet = () => {
  const { connected } = useWallet()

  return (
    <>
      {
        <div className="space-y-4 space-x-4 rounded-xl border-2 p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-x-2">
              <Image src="/solana.png" alt="Premium" width={26} height={26} />
              <h3 className="text-lg font-bold">
                {connected
                  ? 'Your wallet is connected'
                  : 'Connect to your wallet'}
              </h3>
            </div>
            {!connected && (
              <p className="text-muted-foreground">
                Connect your wallet to get redeemable credits
              </p>
            )}
          </div>
          <WalletButton />
        </div>
      }
    </>
  )
}
