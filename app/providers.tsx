import { ClerkProvider } from '@clerk/nextjs';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <ClerkProvider afterSignOutUrl="/">{children}</ClerkProvider>;
};
