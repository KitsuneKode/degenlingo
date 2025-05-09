import { Toaster } from 'sonner'
import { ClerkProvider } from '@clerk/nextjs'
import { ExitModal } from '@/components/modals/exit-modal'
import { HeartsModal } from '@/components/modals/hearts-modal'
import { PracticeModal } from '@/components/modals/practice-modal'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <Toaster richColors theme="system" />
      <ExitModal />
      <HeartsModal />
      <PracticeModal />
      {children}
    </ClerkProvider>
  )
}
