import { lessons, units } from '@/db/schema'
import { UnitBanner } from '@/components/unit-banner'
import { LessonButton } from '@/components/lesson-button'

type Props = {
  id: number
  title: string
  description: string
  order: number
  lessons: (typeof lessons.$inferSelect & { completed: boolean })[]
  activeLessonPercentage: number
  activeLesson:
    | (typeof lessons.$inferSelect & {
        unit: typeof units.$inferSelect
      })
    | undefined
}

export const Unit = ({
  title,
  description,
  lessons,
  activeLesson,
  activeLessonPercentage,
}: Props) => {
  return (
    <>
      <UnitBanner title={title} description={description} />

      <div className="relative mb-[48px] flex flex-col items-center">
        {lessons.map((lesson, index) => {
          const isCurrent = lesson.id === activeLesson?.id
          const isLocked = !lesson.completed && !isCurrent

          return (
            <LessonButton
              key={lesson.id}
              id={lesson.id}
              index={index}
              totalCount={lessons.length - 1}
              locked={isLocked}
              current={isCurrent}
              percentage={activeLessonPercentage}
            />
          )
        })}
      </div>
    </>
  )
}
