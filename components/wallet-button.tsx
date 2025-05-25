// 'use client'

// import { useEffect } from 'react'
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
import { useEffect, useTransition } from 'react'
import { setWallet } from '@/actions/role_check'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
const isDevelopment = process.env.NODE_ENV === 'development'
interface Props {
  className?: string
}
export const WalletButton = ({ className }: Props) => {
  const { isSignedIn } = useAuth()
  const { connected, publicKey } = useWallet()
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (!isSignedIn || connected || pending) return

    if (publicKey) {
      startTransition(() => {
        setWallet(publicKey.toString())
          .then((res) => {
            if (res.message === 'Wallet already set') {
              toast.info('Wallet already set')
              return
            }
            toast.success('Wallet set')
          })
          .catch((err) => {
            if (isDevelopment) {
              console.log(err)
            }
            toast.error('Something went wrong')
          })
      })
    }
  }, [isSignedIn, publicKey, connected, pending])

  return (
    <>
      <div className="flex h-fit w-full items-center justify-center">
        <WalletMultiButton className={cn('w-full', className)} />
      </div>
    </>
  )
}
