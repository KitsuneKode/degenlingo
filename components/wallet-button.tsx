// 'use client'

// import { useEffect, useCallback } from 'react';
// import { useWallet } from '@solana/wallet-adapter-react'
// import { authenticateWithSolana } from '@/actions/create-user'
// import { useAuth, useSession, useSignIn, useSignUp } from '@clerk/nextjs'

// import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

// export const WalletButton = () => {
//   // const [isAuthenticating, setIsAuthenticating] = useState(false)
//   // const [authError, setAuthError] = useState(null)
//   // Handle wallet connection events

//   const { connected, publicKey, signMessage, disconnecting } = useWallet()

//   const { signOut, isLoaded } = useAuth()
//   const { isSignedIn } = useSession()
//   const { signIn } = useSignIn()
//   const { signUp, setActive } = useSignUp()

//   useEffect(() => {
//     if (!connected || !signUp || !publicKey) return

//     console.log('asdhjlas')
//     handleSignIn()

//     if (disconnecting && isSignedIn) {
//       signOut()
//     }
//   }, [connected, disconnecting, publicKey, isSignedIn, signOut, signUp])

//   const handleSignIn = async () => {
//     if (!publicKey || !signMessage || !signUp || !signIn) return

//     const encodedMessage = new TextEncoder().encode(
//       `Sign this message to authenticate with our app: ${Date.now()}`,
//     )

//     const signatureBytes = await signMessage(encodedMessage)
//     if (!signatureBytes) throw new Error('Failed to sign message')

//     // const signatureArray = Array.from(signatureBytes)
//     // const messageArray = Array.from(encodedMessage)

//     // const { success, token, error } = await authenticateWithSolana({
//     //   publicKey: publicKey.toString(),
//     //   signature: signatureArray,
//     //   message: messageArray,
//     // })

//     // console.log(success, token, error)

//     // if (!success) {
//     //   throw new Error(error || 'Authentication failed')
//     // }

//     // Sign in with Clerk using the token
//     // if (token && signUp) {

//     try {
//       // const result = await signUp.create({
//       //   web3Wallet: publicKey.toString(),
//       // })

//       const { createdSessionId, status } =
//         await signUp.attemptWeb3WalletVerification({
//           signature: signatureBytes.toString(),
//         })

//       console.log(createdSessionId)
//       console.log(status)

//       if (status === 'complete') {
//         await setActive({ session: createdSessionId })
//       }
//     } catch (err) {
//       console.log(err)
//     }
//     //   await setActive({
//     //     session: result.createdSessionId,
//     //   })

//     // console.log(result, 'usser')

//     // console.log('Successfully authenticated with Solana wallet')
//   }
//   return (
//     <div>
//       <div id="clerk-captcha" />
//       <WalletMultiButton />
//       <b className="text-xl">{isLoaded} asd</b>
//       <b className="text-xl">{isSignedIn}</b>

//       {/* <button onClick={handleSignIn}>Sign In</button> */}
//     </div>
//   )
// }

// //clerk is shit

'use client'

import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAuth } from '@clerk/nextjs'
import { checkWallet } from '@/lib/roles'
import { useWallet } from '@solana/wallet-adapter-react'
import { setWallet, unsetWallet } from '@/actions/role_check'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useCallback, useEffect, useRef, useTransition } from 'react'

const isDevelopment = process.env.NODE_ENV === 'development'

interface Props {
  className?: string
}

export const WalletButton = ({ className }: Props) => {
  const { isSignedIn } = useAuth()
  const { connected, disconnecting, publicKey, signMessage } = useWallet()
  const [pending, startTransition] = useTransition()
  const walletSet = useRef(false)
  const isProcessing = useRef(false) // Add processing flag

  const handleSignIn = useCallback(async () => {
    if (!publicKey || !signMessage) return

    const encodedMessage = new TextEncoder().encode(
      `Sign this message to authenticate with our app: ${Date.now()}`,
    )

    const signatureBytes = await signMessage(encodedMessage)

    if (!signatureBytes) {
      toast.error('Failed to sign message')
      return
    }

    const signatureArray = Array.from(signatureBytes)
    const messageArray = Array.from(encodedMessage)

    return { signatureArray, messageArray }
  }, [publicKey, signMessage])

  useEffect(() => {
    // Early returns to prevent unnecessary processing
    if (
      !isSignedIn ||
      !connected ||
      !publicKey ||
      !signMessage ||
      pending ||
      walletSet.current ||
      isProcessing.current // Prevent concurrent processing
    ) {
      return
    }

    // Set processing flag immediately
    isProcessing.current = true

    startTransition(async () => {
      try {
        // First check if wallet already exists
        const existingWallet = await checkWallet(publicKey.toString())

        if (existingWallet) {
          walletSet.current = true
          isProcessing.current = false
          return
        }

        // Only sign if wallet doesn't exist
        const response = await handleSignIn()

        if (!response || !response.signatureArray || !response.messageArray) {
          isProcessing.current = false
          return
        }

        const result = await setWallet(
          publicKey.toString(),
          response.signatureArray,
          response.messageArray,
        )

        if (result.message === 'Wallet already set') {
          toast.info('Wallet already set')
        } else {
          toast.success('Wallet set')
        }

        walletSet.current = true
      } catch (err) {
        if (isDevelopment) {
          console.log(err)
        }
        toast.error('Something went wrong')
      } finally {
        isProcessing.current = false
      }
    })
  }, [isSignedIn, publicKey, connected, pending, signMessage]) // Remove handleSignIn from deps

  // Reset flags when wallet disconnects

  useEffect(() => {
    if ((!walletSet.current || isProcessing.current) && !disconnecting) return

    if (disconnecting) {
      isProcessing.current = true
      startTransition(() => {
        unsetWallet()
          .then((r) => {
            if (r.message) toast.warning('Wallet association removed')
          })

          .finally(() => {
            walletSet.current = false
            isProcessing.current = false
          })
      })
    }
  }, [publicKey, disconnecting, pending])

  return (
    <>
      <div className="flex h-fit w-full items-center justify-center">
        <WalletMultiButton className={cn('w-full', className)} />
      </div>
    </>
  )
}
