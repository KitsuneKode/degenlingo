'use client'

import { toast } from 'sonner'
import { useTransition } from 'react'
import { courses } from '@/db/schema'
import { Card } from '@/components/card'
import { userProgress } from '@/db/schema'
import { useRouter } from 'next/navigation'
import { upsertUserProgress } from '@/actions/user-progress'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

type Props = {
  courses: (typeof courses.$inferSelect)[]
  activeCourseId?: typeof userProgress.$inferSelect.activeCourseId
}

export const List = ({ courses, activeCourseId }: Props) => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const onClick = (id: number) => {
    if (pending) return

    if (id === activeCourseId) {
      router.push(`/learn/`)
      return
    }

    startTransition(() => {
      upsertUserProgress(id).catch((err) => {
        if (isRedirectError(err)) {
          return
        }
        toast.error('Something went wrong')
      })
    })
  }

  return (
    <div className="grid grid-cols-2 gap-4 pt-6 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))]">
      {courses.map((course) => (
        <Card
          key={course.id}
          id={course.id}
          title={course.title}
          imageSrc={course.imageSrc}
          onClick={onClick}
          disabled={pending}
          active={course.id === activeCourseId}
        />
      ))}
    </div>
  )
}
