'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { UserNotificationsBell } from '@/components/notifications/UserNotificationsBell'

const primaryLinks = [
  { href: '/competitions', label: 'Competitions' },
  { href: '/chat', label: 'Community' },
  { href: '/meeting', label: 'Meetings' },
]

export function HomeNav() {
  const { user, loading, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color:var(--surface)]/96 backdrop-blur">
      <div className="content-wrap">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[color:var(--surface-muted)] text-lg">
              ❄️
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight">Taakra</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--muted)]">
                Snowy Competition Platform
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {primaryLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--muted)] transition-colors hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--foreground)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {loading ? (
              <span className="text-xs text-[color:var(--muted)]">Loading...</span>
            ) : user ? (
              <>
                <UserNotificationsBell userId={user.id} />
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="chip hidden sm:inline-flex"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="btn-secondary px-3 py-2 text-sm"
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="btn-primary px-3 py-2 text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary px-3 py-2 text-sm">
                  Sign in
                </Link>
                <Link href="/signup" className="btn-primary px-3 py-2 text-sm">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <nav className="border-t border-[var(--border)] md:hidden">
        <div className="content-wrap">
          <div className="flex gap-1 overflow-x-auto py-2">
            {primaryLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-[color:var(--muted)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--foreground)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}
