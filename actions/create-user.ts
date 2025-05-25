// 'use server'

// import { PublicKey } from '@solana/web3.js'
// import { ed25519 } from '@noble/curves/ed25519'
// import { clerkClient } from '@clerk/nextjs/server'

// export async function authenticateWithSolana({
//   publicKey,
//   signature,
//   message,
// }: {
//   publicKey: string
//   signature: number[]
//   message: number[]
// }) {
//   try {
//     const pubkey = new PublicKey(publicKey)
//     // Convert number arrays to Uint8Array instances
//     const signatureBytes = Uint8Array.from(signature)
//     const messageBytes = Uint8Array.from(message)

//     // Verify the signature
//     const verified = ed25519.verify(
//       signatureBytes,
//       messageBytes,
//       pubkey.toBytes(),
//     )

//     if (!verified) {
//       return { success: false, error: 'Invalid signature' }
//     }

//     const clerk = await clerkClient()

//     let user
//     try {
//       const existingUsers = await clerk.users.getUserList({
//         externalId: [pubkey.toString()],
//       })

//       if (existingUsers.data.length > 0) {
//         user = existingUsers.data[0]

//         console.log(user, 'user')
//       } else {
//         // Create new user if not found
//         user = await clerk.users.createUser({
//           externalId: pubkey.toString(),
//           publicMetadata: {
//             walletAddress: pubkey.toString(),
//             chain: 'solana',
//           },
//         })
//       }

//       // Create a session token
//       const token = await clerk.sessions.createSession({
//         userId: user.id,
//       })

//       console.log(token, 'token', 'type', typeof token)
//       const status = token.status === 'active'
//       return {
//         success: status,
//         token: token.id,
//       }
//     } catch (clerkError) {
//       console.error('Clerk error:', clerkError)
//       console.log(clerkError)
//       return { success: false, error: 'User authentication failed' }
//     }
//   } catch (error) {
//     console.error('Server action error:', error)
//     console.log(error)
//     return { success: false, error: 'Server error during authentication' }
//   }
// }

//shitty clerk issues
