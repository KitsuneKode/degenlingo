'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = {
  label: string;
  iconScr: string;
  href: string;
};

export const SidebarItem = ({ label, iconScr, href }: Props) => {
  const pathname = usePathname();

  const active = pathname === href;
  return (
    <Button
      variant={active ? 'sidebarOutline' : 'sidebar'}
      className="justify-start h-[52px]"
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
  );
};
