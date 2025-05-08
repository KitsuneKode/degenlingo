import { List } from '@/components/list'
import { getCourses, getUserProgress } from '@/db/queries'

const CoursesPage = async () => {
  const coursesData = getCourses()
  const userProgressData = getUserProgress()

  const [courses, userProgress] = await Promise.all([
    coursesData,
    userProgressData,
  ])

  return (
    <div className="maz-w-[912px] mx-auto h-full px-3">
      <h1 className="text-2xl font-bold text-neutral-700">Language Courses</h1>
      <List courses={courses} activeCourseId={userProgress?.activeCourseId} />
    </div>
  )
}
export default CoursesPage
