'use client'

import Link from 'next/link'
import { toast } from 'sonner'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

type Props = {
  title: string
  description: string
  nftClaimed: boolean
  unitCompleted: boolean
  nftImageSrc: string
}

export const UnitBanner = ({
  title,
  description,
  nftClaimed,
  unitCompleted,
  nftImageSrc,
}: Props) => {
  return (
    <div className="flex w-full items-center justify-between rounded-xl bg-purple-500 p-5 text-white">
      <div className="space-y-2.5">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-lg">{description}</p>
      </div>

      <Link href={unitCompleted && !nftClaimed ? '/tokens' : '/learn'}>
        <Button
          size="lg"
          variant={
            unitCompleted
              ? nftClaimed
                ? 'locked'
                : 'secondaryOutline'
              : 'default'
          }
          onClick={() => {
            if (nftClaimed) {
              toast.info('NFT already claimed')
            }
          }}
          className="hidden border-2 border-b-4 active:border-b-2 xl:flex"
        >
          <Image
            src={nftImageSrc}
            alt="NFT"
            width={30}
            height={30}
            className="mr-2 rounded-full"
          />
          {unitCompleted
            ? nftClaimed
              ? 'NFT Claimed'
              : 'Claim your NFT'
            : 'Complete to claim NFT'}
        </Button>
      </Link>
    </div>
  )
}
