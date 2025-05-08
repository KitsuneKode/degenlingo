import '@/app/globals.css'
import type { Metadata } from 'next'
import { Header } from '@/app/(marketing)/header'

import { Footer } from '@/app/(marketing)/footer'

export const metadata: Metadata = {
  title: 'DegenLingo',
  description:
    'DegenLingo - The best place to learn a new language with crypto',
}

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center">
        {children}
      </main>
      <Footer />
    </div>
  )
}
