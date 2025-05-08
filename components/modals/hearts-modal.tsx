'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { useHeartModal } from '@/store/use-heart-modal'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export const HeartsModal = () => {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const { isOpen, close } = useHeartModal()

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  const onClick = () => {
    close()
    router.push('/shop')
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-5 flex w-full items-center justify-center">
            <Image src="/mascot_bad.svg" alt="Mascot" width={80} height={80} />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            You ran out of hearts!
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Get Pro for unlimited hearts or purchase them in the shop.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mb-4">
          <div className="flex w-full flex-col gap-y-4">
            <Button
              variant="primary"
              className="w-full"
              size="lg"
              onClick={onClick}
            >
              Get unlimited hearts
            </Button>
            <Button
              variant="primaryOutline"
              className="w-full"
              size="lg"
              onClick={close}
            >
              No thanks
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
