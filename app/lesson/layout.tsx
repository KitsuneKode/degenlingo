import type { Metadata } from 'next'

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
    <div className="flex h-full flex-col">
      <div className="flex h-full w-full flex-col">{children}</div>
    </div>
  )
}
