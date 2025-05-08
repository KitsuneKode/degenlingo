'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

type Props = {
  label: string
  iconScr: string
  href: string
}

export const SidebarItem = ({ label, iconScr, href }: Props) => {
  const pathname = usePathname()

  const active = pathname === href
  return (
    <Button
      variant={active ? 'sidebarOutline' : 'sidebar'}
      className="h-[52px] justify-start"
      asChild
    >
      <Link href={href}>
        <Image
          src={iconScr}
          width={32}
          height={32}
          alt={label}
          className="mr-5"
        />

        {label}
      </Link>
    </Button>
  )
}
