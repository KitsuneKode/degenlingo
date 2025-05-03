import type { Metadata } from 'next'
import '@/app/globals.css'
import { Header } from '@/app/(markerting)/header'
import { Footer } from '@/app/(markerting)/footer'

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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center">
        {children}
      </main>
      <Footer />
    </div>
  )
}
