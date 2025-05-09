import { Loader } from 'lucide-react'

const Loading = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader className="animate-spin" size={24} />
    </div>
  )
}

export default Loading
