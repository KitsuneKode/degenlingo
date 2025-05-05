import { ExitModal } from '@/components/modals/exit-modal'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <ExitModal />
      <Toaster />
      {children}
    </ClerkProvider>
  )
}
