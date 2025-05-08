import '@/app/globals.css'
import type { Metadata } from 'next'
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
      <main className="h-full pt-[50px] lg:p-0 lg:pl-[256px]">
        <div className="mx-auto h-full max-w-[1056px] pt-6">{children}</div>
      </main>
    </>
  )
}
