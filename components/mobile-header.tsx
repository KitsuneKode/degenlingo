import { MobileSidebar } from '@/components/mobile-sidebar'

export const MobileHeader = () => {
  return (
    <nav className="lg:hidden px-6 h-[50px] bg-green-500 flex items-center border-b fixed top-0 w-full z-50">
      <MobileSidebar />
    </nav>
  )
}
