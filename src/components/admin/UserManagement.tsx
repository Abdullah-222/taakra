'use client'

import { useEffect, useState } from 'react'

interface UserRow {
  id: number
  email: string
  name: string | null
  role: string
  createdAt: string
}

export function UserManagement() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (!res.ok) {
        if (res.status === 403) setError('Access denied')
        return
      }
      const data = await res.json()
      setUsers(data.users || [])
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    setAdding(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to add user')
        setAdding(false)
        return
      }
      setSuccess('User created. Credentials have been sent to their email.')
      setEmail('')
      setName('')
      fetchUsers()
    } catch {
      setError('Something went wrong')
    } finally {
      setAdding(false)
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">Add user</h2>
        <form onSubmit={handleAddUser} className="space-y-4 max-w-md">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm text-emerald-800 dark:text-emerald-200">
              {success}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-1">
              Email *
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-2 border border-stone-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              required
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-1">
              Name (optional)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full px-4 py-2 border border-stone-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <p className="text-xs text-stone-500 dark:text-gray-400">
            A random password will be generated and sent to the user&apos;s email via Resend.
          </p>
          <button
            type="submit"
            disabled={adding}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding ? 'Adding...' : 'Add user & send credentials'}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white p-4 border-b border-stone-200 dark:border-gray-700">
          All users
        </h2>
        {loading ? (
          <div className="p-8 text-center text-stone-500 dark:text-gray-400">Loading...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-stone-500 dark:text-gray-400">No users yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50 dark:bg-gray-700/50 text-left text-sm font-medium text-stone-600 dark:text-gray-400">
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-stone-200 dark:border-gray-700 text-stone-900 dark:text-white">
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.name || '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          u.role === 'admin'
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                            : 'bg-stone-100 dark:bg-gray-700 text-stone-700 dark:text-gray-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-600 dark:text-gray-400 text-sm">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
