'use client'

import { PostPagination, filters } from '@/app/admin/pagination'
import {
  BooleanField,
  Datagrid,
  List,
  ReferenceField,
  TextField,
} from 'react-admin'

export const ChallengeOptionList = () => {
  return (
    <List pagination={<PostPagination />} filters={filters}>
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="text" />
        <BooleanField source="correct" />
        <ReferenceField source="challengeId" reference="challenges" />
        <TextField source="imgSrc" />
        <TextField source="audioSrc" />
      </Datagrid>
    </List>
  )
}
