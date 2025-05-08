import { Button } from '@/components/ui/button'

export default function Preview() {
  return (
    <div className="flex max-w-[200px] flex-col space-y-4 p-4">
      <Button>Default</Button>
      <Button variant="primary">Primary</Button>
      <Button variant="primaryOutline">Primary Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="secondaryOutline">Secondary Outline</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="destructiveOutline">Destructive Outline</Button>
      <Button variant="super">Super</Button>
      <Button variant="superOutline">Super Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="sidebar">Sidebar</Button>
      <Button variant="sidebarOutline">Sidebar Outline</Button>
    </div>
  )
}
