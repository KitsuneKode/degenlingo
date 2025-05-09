import { Pagination, SearchInput } from 'react-admin'

export const PostPagination = () => (
  <Pagination
    rowsPerPageOptions={[
      { label: '10', value: 10 },
      { label: '20', value: 20 },
      { label: '50', value: 50 },
      { label: '100', value: 100 },
    ]}
    rowSpan={10}
    padding="normal"
    // limit={10}
  />
)
export const filters = [<SearchInput key="q" source="q" alwaysOn />]
// export const postFilters = [
//   <SearchInput key="q" source="q" alwaysOn />,
//   <TextInput
//     key="title"
//     label="Title"
//     source="title"
//     defaultValue="Hello, World!"
//   />,
// ]

// export const ListActions = () => (
//   <TopToolbar>
//     <SelectColumnsButton />
//     <FilterButton />
//     <CreateButton />
//     <ExportButton />
//   </TopToolbar>
// )
