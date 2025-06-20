import Link from 'next/link'
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
  SignUpButton,
} from '@clerk/nextjs'

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-[988px] flex-1 flex-col items-center justify-center gap-2 p-4 lg:flex-row">
      <div className="relative mb-8 h-[240px] w-[240px] lg:mb-0 lg:h-[424px] lg:w-[424px]">
        <Image src="/hero.svg" fill alt="Hero" />
      </div>

      <div className="flex flex-col items-center gap-y-8">
        <h1 className="max-w-[480px] text-center text-xl font-bold text-neutral-600 lg:text-3xl">
          Learn, practice and master new languages with DegenLingo
        </h1>

        <SignedOut>
          <p className="max-w-[480px] text-center text-sm font-bold text-neutral-600 lg:text-xl">
            Login to connect your wallet
          </p>
        </SignedOut>
        <div className="flex w-full max-w-[330px] flex-col items-center gap-y-3">
          <ClerkLoading>
            <Loader className="text-muted-foreground h-5 w-5 animate-spin" />
          </ClerkLoading>

          <ClerkLoaded>
            <SignedOut>
              <SignUpButton
                mode="modal"
                oauthFlow="popup"
                // signInFallbackRedirectUrl="/learn"
                fallbackRedirectUrl="/"
              >
                <Button size="lg" variant="secondary" className="w-full">
                  Get Started
                </Button>
              </SignUpButton>
              <SignInButton
                mode="modal"
                oauthFlow="popup"
                // signUpFallbackRedirectUrl="/learn"
                fallbackRedirectUrl="/"
              >
                <Button size="lg" variant="primaryOutline" className="w-full">
                  I already have an account
                </Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <Button size="lg" variant="secondary" className="w-full" asChild>
                <Link href="/learn">Continue Learning</Link>
              </Button>
              <WalletButton />
            </SignedIn>
          </ClerkLoaded>
        </div>
      </div>
    </div>
  )
}
