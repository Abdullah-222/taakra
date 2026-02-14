'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AdminNotificationsBell } from '@/components/admin/AdminNotificationsBell'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { href: '/admin/competitions', label: 'Competitions', icon: '❄️' },
  { href: '/admin/payments', label: 'Payments', icon: '💳' },
  { href: '/admin/registrations', label: 'Registrations', icon: '📝' },
  { href: '/admin/requests', label: 'Requests', icon: '📅' },
  { href: '/admin/users', label: 'User Management', icon: '👥' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
]

const dummyNavItems = [
  { href: '/admin/reports', label: 'Reports', icon: '📄' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [adminRole, setAdminRole] = useState<boolean | null>(null)

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/login')
      return
    }
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        setAdminRole(data.user?.role === 'admin')
        if (data.user && data.user.role !== 'admin') {
          router.push('/')
        }
      })
      .catch(() => setAdminRole(false))
  }, [user, loading, router])

  if (loading || adminRole === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-gray-900">
        <div className="text-stone-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!user || adminRole === false) {
    return null
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-stone-200 dark:border-gray-700 flex flex-col shrink-0">
        <div className="p-6 border-b border-stone-200 dark:border-gray-700">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 dark:from-emerald-500 dark:to-emerald-400 bg-clip-text text-transparent">
            EstatePro
          </Link>
          <p className="text-xs text-stone-500 dark:text-gray-400 mt-1">Admin</p>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : 'text-stone-700 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
          <div className="pt-4 mt-4 border-t border-stone-200 dark:border-gray-700">
            <p className="px-4 text-xs font-semibold text-stone-400 dark:text-gray-500 uppercase tracking-wider">
              More
            </p>
            {dummyNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-stone-600 dark:text-gray-400 hover:bg-stone-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
        <div className="p-4 border-t border-stone-200 dark:border-gray-700">
          <div className="px-4 py-2 text-sm text-stone-600 dark:text-gray-400 truncate">
            {user.email}
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="flex-1 text-center px-3 py-2 text-sm font-medium text-stone-600 dark:text-gray-400 hover:bg-stone-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Site
            </Link>
            <button
              onClick={() => logout()}
              className="flex-1 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 px-6 py-3 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400 dark:text-gray-500">
                Admin Console
              </p>
              <h2 className="text-lg font-semibold text-stone-800 dark:text-gray-100">Overview</h2>
            </div>
            <AdminNotificationsBell userId={user.id} />
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
