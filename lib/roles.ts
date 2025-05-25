'use server'

import { Roles } from '@/types/globals'
import { auth } from '@clerk/nextjs/server'

export const checkRole = async (role: Roles) => {
  const { sessionClaims } = await auth()
  return sessionClaims?.metadata.role === role
}

export const checkWallet = async (walletAddress: string) => {
  const { sessionClaims } = await auth()

  return (
    sessionClaims?.metadata.wallet?.address === walletAddress &&
    sessionClaims?.metadata.wallet?.verified === true
  )
}
