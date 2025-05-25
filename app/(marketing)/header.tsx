import Image from 'next/image'
import { Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WalletButton } from '@/components/wallet-button'
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/nextjs'

export const Header = () => {
  return (
    <header className="h-20 w-full border-b-2 border-slate-200 px-4">
      <div className="mx-auto flex h-full items-center justify-between lg:max-w-screen-lg">
        <div className="flex items-center gap-x-3 pt-8 pb-7 pl-4">
          <Image src="/mascot.svg" height={40} width={40} alt="Mascot" />
          <h1 className="text-2xl font-extrabold tracking-wide text-purple-600">
            DegenLingo
          </h1>
        </div>

        <ClerkLoading>
          <Loader className="text-muted-foreground h-5 w-5 animate-spin" />
        </ClerkLoading>
        <ClerkLoaded>
          <SignedIn>
            <div className="flex items-center gap-x-6">
              <WalletButton />

              <UserButton />
            </div>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal" oauthFlow="popup">
              <Button size="lg" variant="ghost">
                Login
              </Button>
            </SignInButton>
          </SignedOut>
        </ClerkLoaded>
      </div>
    </header>
  )
}
