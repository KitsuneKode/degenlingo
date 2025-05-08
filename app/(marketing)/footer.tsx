import Image from 'next/image'
import { Button } from '@/components/ui/button'

export const Footer = () => {
  return (
    <footer className="b hidden h-20 w-full border-t-2 border-slate-200 p-2 lg:block">
      <div className="mx-auto flex h-full max-w-screen-lg items-center justify-evenly">
        <Button size="lg" variant="ghost">
          <Image
            src="/en.svg"
            height={32}
            width={40}
            alt="English"
            className="mr-4 rounded-md"
          />
          English
        </Button>
        <Button size="lg" variant="ghost">
          <Image
            src="/jp.svg"
            height={32}
            width={40}
            alt="Japanese"
            className="mr-4 rounded-md"
          />
          Japanese
        </Button>
        <Button size="lg" variant="ghost">
          <Image
            src="/es.svg"
            height={32}
            width={40}
            alt="Spanish"
            className="mr-4 rounded-md"
          />
          Spanish
        </Button>
        <Button size="lg" variant="ghost">
          <Image
            src="/it.svg"
            height={32}
            width={40}
            alt="Italian"
            className="mr-4 rounded-md"
          />
          Italian
        </Button>

        <Button size="lg" variant="ghost">
          <Image
            src="/fr.svg"
            height={32}
            width={40}
            alt="French"
            className="mr-4 rounded-md"
          />
          French
        </Button>
      </div>
    </footer>
  )
}
