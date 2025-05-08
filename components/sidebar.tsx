import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Loader } from 'lucide-react'
import { SidebarItem } from '@/components/sidebar-item'
import { ClerkLoaded, ClerkLoading, UserButton } from '@clerk/nextjs'

type Props = {
  className?: string
}

export const Sidebar = ({ className }: Props) => {
  return (
    <div
      className={cn(
        'top-0 left-0 flex h-full flex-col px-4 lg:fixed lg:w-[256px] lg:border-r-2',
        className,
      )}
    >
      <Link href="/learn">
        <div className="flex items-center gap-x-3 pt-8 pb-7 pl-4">
          <Image src="/mascot.svg" height={40} width={40} alt="Mascot" />
          <h1 className="text-2xl font-extrabold tracking-wide text-purple-600">
            DegenLingo
          </h1>
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-y-2">
        <SidebarItem label="Learn" href="/learn" iconScr="/learn.svg" />
        <SidebarItem
          label="Leaderboard"
          href="/leaderboard"
          iconScr="/leaderboard.svg"
        />
        <SidebarItem label="quests" href="/quests" iconScr="/quests.svg" />
        <SidebarItem label="shop" href="/shop" iconScr="/shop.svg" />
      </div>

      <div className="p-4">
        <ClerkLoading>
          <Loader className="text-muted-foreground h-5 w-5 animate-spin" />
        </ClerkLoading>
        <ClerkLoaded>
          <UserButton />
        </ClerkLoaded>
      </div>
    </div>
  )
}
