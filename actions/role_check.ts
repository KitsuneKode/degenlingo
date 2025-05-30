'use server'

import { PublicKey } from '@solana/web3.js'
import { ed25519 } from '@noble/curves/ed25519'
import { checkRole, checkWallet } from '@/lib/roles'
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function setRole(formData: FormData) {
  const client = await clerkClient()

  // Check that the user trying to set the role is an admin
  if (!checkRole('admin')) {
    throw new Error('Not Authorized')
  }

  try {
    const res = await client.users.updateUserMetadata(
      formData.get('id') as string,
      {
        publicMetadata: { role: formData.get('role') },
      },
    )
    return { message: res.publicMetadata }
  } catch (err) {
    return { message: err }
  }
}

export async function removeRole(formData: FormData) {
  const client = await clerkClient()

  try {
    const res = await client.users.updateUserMetadata(
      formData.get('id') as string,
      {
        publicMetadata: { role: null },
      },
    )
    return { message: res.publicMetadata }
  } catch (err) {
    return { message: err }
  }
}

export async function setWallet(
  walletAddress: string,
  signature: number[],
  message: number[],
) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const client = await clerkClient()

  const pubkey = new PublicKey(walletAddress)
  const signatureBytes = Uint8Array.from(signature)
  const messageBytes = Uint8Array.from(message)

  const verified = ed25519.verify(
    signatureBytes,
    messageBytes,
    pubkey.toBytes(),
  )

  if (!verified) {
    throw new Error('Invalid signature')
  }

  const wallet = await checkWallet(walletAddress)

  if (wallet) {
    return { message: 'Wallet already set' }
  }

  try {
    const res = await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        wallet: {
          address: walletAddress,
          chain: 'solana',
          verified,
        },
      },
    })
    return { message: res.publicMetadata }
  } catch (err) {
    return { message: err }
  }
}
export async function unsetWallet() {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const client = await clerkClient()

  try {
    const res = await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        wallet: null,
      },
    })
    return { message: res.publicMetadata }
  } catch (err) {
    return { error: (err as Error).message }
  }
}
