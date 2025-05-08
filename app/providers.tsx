import { Toaster } from 'sonner'
import { ClerkProvider } from '@clerk/nextjs'
import { ExitModal } from '@/components/modals/exit-modal'
import { HeartsModal } from '@/components/modals/hearts-modal'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <Toaster richColors theme="system" />
      <ExitModal />
      <HeartsModal />
      {children}
    </ClerkProvider>
  )
}
