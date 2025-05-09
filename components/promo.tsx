import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export const Promo = () => {
  return (
    <div className="space-y-4 space-x-4 rounded-xl border-2 p-4">
      <div className="space-y-2">
        <div className="flex items-center gap-x-2">
          <Image src="/unlimited.svg" alt="Premium" width={26} height={26} />
          <h3 className="text-lg font-bold">Upgrade to Premium</h3>
        </div>
        <p className="text-muted-foreground">Get unlimited hearts and more</p>
      </div>
      <Button asChild variant="super" className="w-full" size="lg">
        <Link href="/shop">Upgrade today</Link>
      </Button>
    </div>
  )
}
