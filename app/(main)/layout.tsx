import type { Metadata } from 'next'
import '@/app/globals.css'
import { Sidebar } from '@/components/sidebar'
import { MobileHeader } from '@/components/mobile-header'

export const metadata: Metadata = {
  title: 'DegenLingo',
  description:
    'DegenLingo - The best place to learn a new language with crypto',
}

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <MobileHeader />
      <Sidebar className="hidden lg:flex" />
      <main className="lg:pl-[256px] h-full pt-[50px] lg:p-0">
        <div className="max-w-[1056px] mx-auto pt-6 h-full">{children}</div>
      </main>
    </>
  )
}
