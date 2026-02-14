'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { theme } from '@/lib/theme'
import { AdminNotificationsBell } from '@/components/admin/AdminNotificationsBell'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { href: '/admin/competitions', label: 'Competitions', icon: '❄️' },
  { href: '/admin/payments', label: 'Payments', icon: '💳' },
  { href: '/admin/registrations', label: 'Registrations', icon: '📝' },
  { href: '/admin/requests', label: 'Requests', icon: '📅' },
  { href: '/admin/support', label: 'Support', icon: '💬' },
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div style={{ color: theme.colors.textMuted }}>Loading...</div>
      </div>
    )
  }

  if (!user || adminRole === false) {
    return null
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      {/* Sidebar */}
      <aside 
        className="w-64 flex flex-col shrink-0 transition-all duration-300"
        style={{
          background: theme.glass.background,
          backdropFilter: theme.glass.blur,
          borderRight: theme.glass.border,
        }}
      >
        <div 
          className="p-6"
          style={{
            borderBottom: theme.glass.border,
          }}
        >
          <Link 
            href="/" 
            className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 dark:from-emerald-500 dark:to-emerald-400 bg-clip-text text-transparent"
          >
            TAAKRA
          </Link>
          <p className="text-xs mt-1" style={{ color: theme.colors.textMuted }}>Admin</p>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: isActive
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'transparent',
                  color: isActive
                    ? theme.colors.success
                    : theme.colors.textSecondary,
                  border: isActive ? `1px solid ${theme.colors.success}40` : '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
          <div 
            className="pt-4 mt-4"
            style={{
              borderTop: theme.glass.border,
            }}
          >
            <p 
              className="px-4 text-xs font-semibold uppercase tracking-wider"
              style={{ color: theme.colors.textMuted }}
            >
              More
            </p>
            {dummyNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                style={{
                  color: theme.colors.textSecondary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
        <div 
          className="p-4"
          style={{
            borderTop: theme.glass.border,
          }}
        >
          <div 
            className="px-4 py-2 text-sm truncate"
            style={{ color: theme.colors.textSecondary }}
          >
            {user.email}
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="flex-1 text-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-[1.02]"
              style={{
                color: theme.colors.textSecondary,
                background: 'transparent',
                border: theme.glass.border,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              Site
            </Link>
            <button
              onClick={() => logout()}
              className="flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-[1.02]"
              style={{
                color: theme.colors.danger,
                background: 'transparent',
                border: theme.glass.border,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div 
          className="sticky top-0 z-30 px-6 py-3 backdrop-blur transition-all duration-300 glass-animated"
          style={{
            background: theme.glass.background,
            borderBottom: theme.glass.border,
            backdropFilter: theme.glass.blur,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p 
                className="text-xs font-semibold uppercase tracking-[0.2em]"
                style={{ color: theme.colors.textMuted }}
              >
                Admin Console
              </p>
              <h2 
                className="text-lg font-semibold"
                style={{ color: theme.colors.textPrimary }}
              >
                Overview
              </h2>
            </div>
            <AdminNotificationsBell userId={user.id} />
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
