import './globals.css'
import type { Metadata } from 'next'
import { Providers } from '@/app/providers'
import { DM_Mono, Exo_2 } from 'next/font/google'
import { AppWalletProvider } from '@/app/wallet-provider'

const exo2 = Exo_2({
  variable: '--font-exo-2',
  subsets: ['latin'],
})

const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  subsets: ['latin'],
  weight: ['300', '500'],
})

export const metadata: Metadata = {
  title: 'DegenLingo',
  description: 'Learn, Earn, Spend, Share - The DeFi of Language Learning',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${exo2.variable} ${dmMono.variable} antialiased`}>
        <AppWalletProvider>
          <Providers>{children}</Providers>
        </AppWalletProvider>
      </body>
    </html>
  )
}
