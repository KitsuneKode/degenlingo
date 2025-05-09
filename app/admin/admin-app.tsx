'use client'

import { UnitEdit } from './unit/edit'
import { UnitList } from './unit/list'
import { UnitCreate } from './unit/create'

import { CourseEdit } from './course/edit'
import { CourseCreate } from './course/create'
import { CourseList } from '@/app/admin/course/list'

import { LessonList } from './lesson/list'
import { LessonEdit } from './lesson/edit'
import { LessonCreate } from './lesson/create'

import { ChallengeEdit } from './challenge/edit'
import { ChallengeList } from './challenge/list'
import { ChallengeCreate } from './challenge/create'

import { ChallengeOptionList } from './challengeOption/list'
import { ChallengeOptionEdit } from './challengeOption/edit'
import { ChallengeOptionCreate } from './challengeOption/create'

import simpleRestProvider from 'ra-data-simple-rest'
import { Admin, houseDarkTheme, Resource } from 'react-admin'

const dataProvider = simpleRestProvider('/api')

const AdminApp = () => {
  return (
    <Admin dataProvider={dataProvider} darkTheme={houseDarkTheme}>
      <Resource
        name="courses"
        list={CourseList}
        create={CourseCreate}
        edit={CourseEdit}
        recordRepresentation="title"
      />
      <Resource
        name="units"
        list={UnitList}
        create={UnitCreate}
        edit={UnitEdit}
        recordRepresentation="title"
      />
      <Resource
        name="lessons"
        list={LessonList}
        create={LessonCreate}
        edit={LessonEdit}
        recordRepresentation="title"
      />
      <Resource
        name="challenges"
        list={ChallengeList}
        create={ChallengeCreate}
        edit={ChallengeEdit}
        recordRepresentation="question"
      />
      <Resource
        name="challengeOptions"
        list={ChallengeOptionList}
        create={ChallengeOptionCreate}
        edit={ChallengeOptionEdit}
        recordRepresentation="text"
        options={{
          label: 'Challenge Options',
        }}
      />
    </Admin>
  )
}
export default AdminApp
