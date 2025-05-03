import { Button } from '../../components/ui/button'
import Image from 'next/image'

export const Footer = () => {
  return (
    <footer className="hidden lg:block h-20 w-full border-t-2 border-slate-200 p-2 b">
      <div className="max-w-screen-lg mx-auto flex items-center justify-evenly h-full">
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
