import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <Toaster />
      {children}
    </ClerkProvider>
  )
}
