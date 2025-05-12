import { Loader } from 'lucide-react'

const Loading = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader className="text-muted-foreground h-6 w-6 animate-spin" />
    </div>
  )
}

export default Loading
