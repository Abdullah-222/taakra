import { UserManagement } from '@/components/admin/UserManagement'

export default function AdminUsersPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">User Management</h1>
      <p className="text-stone-600 dark:text-gray-400 mb-8">
        Add users and send their login credentials by email.
      </p>
      <UserManagement />
    </div>
  )
}
