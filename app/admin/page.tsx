'use client'

import Loading from './loading'
import dynamic from 'next/dynamic'

const AdminApp = dynamic(() => import('./admin-app'), {
  loading: () => <Loading />,
  ssr: false,
})

export default function AdminPage() {
  return <AdminApp />
}
