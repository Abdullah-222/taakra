'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { theme } from '@/lib/theme'
import { useAuth } from '@/hooks/useAuth'
import { UserNotificationsBell } from '@/components/notifications/UserNotificationsBell'

const primaryLinks = [
  { href: '/competitions', label: 'Competitions' },
  { href: '/chat', label: 'Community' },
  { href: '/meeting', label: 'Meetings' },
  { href: '/contact', label: 'Contact' },
]

export function Navbar() {
  const { theme: currentTheme, setTheme } = useTheme()
  const { user, loading, logout } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 mx-4 mt-4 flex flex-col gap-0 rounded-2xl transition-all duration-300" style={{ boxShadow: theme.glass.shadow }}>
      <nav
        className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 rounded-2xl"
        style={{
          background: theme.glass.background,
          backdropFilter: theme.glass.blur,
          border: theme.glass.border,
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-all">
            ❄️
          </div>
          <div>
            <span className="font-bold text-lg block leading-tight" style={{ color: theme.colors.textPrimary }}>
              EstatePro
            </span>
            <span className="text-[10px] uppercase tracking-wider hidden sm:block" style={{ color: theme.colors.textMuted }}>
              Competitions &amp; Community
            </span>
          </div>
        </Link>

        {/* Center: Competitions / Community / Meetings (desktop) */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
          {primaryLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:opacity-90 transition-colors"
              style={{ color: theme.colors.textSecondary }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right: Theme, Notifications, Auth */}
        <div className="flex items-center gap-2 sm:gap-4">
          {user && <UserNotificationsBell userId={user.id} />}
          {user && String(user.role).toLowerCase() === 'admin' && (
            <Link
              href="/admin"
              className="inline-flex px-3 py-2 rounded-xl text-sm font-medium border transition-colors shrink-0"
              style={{
                borderColor: theme.glass.border,
                color: theme.colors.textPrimary,
                background: theme.glass.background,
              }}
            >
              Admin
            </Link>
          )}

          <button
            onClick={toggleTheme}
            className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all hover:scale-110 active:scale-95 overflow-hidden"
            style={{
              background: 'rgba(125, 211, 252, 0.1)',
              border: `1px solid ${theme.colors.frost200}`,
              color: theme.colors.textPrimary,
            }}
            aria-label="Toggle Theme"
          >
            {mounted ? (
              currentTheme === 'dark' ? (
                <span className="text-yellow-300 text-lg animate-in fade-in zoom-in spin-in-90 duration-300">🌙</span>
              ) : (
                <span className="text-orange-400 text-lg animate-in fade-in zoom-in spin-in-90 duration-300">☀️</span>
              )
            ) : (
              <span className="opacity-0">.</span>
            )}
          </button>

          {loading ? (
            <span className="text-xs" style={{ color: theme.colors.textMuted }}>
              Loading...
            </span>
          ) : user ? (
            <>
              <Link href="/profile">
                <button
                  className="px-3 py-2 sm:px-4 rounded-xl text-sm font-medium border transition-colors"
                  style={{
                    borderColor: theme.glass.border,
                    color: theme.colors.textPrimary,
                    background: theme.glass.background,
                  }}
                >
                  Profile
                </button>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="px-4 py-2 sm:px-5 rounded-xl text-sm font-bold shadow-lg transition-transform hover:-translate-y-0.5"
                style={{
                  background: theme.buttons.primary.background,
                  color: theme.buttons.primary.color,
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                <button
                  className="px-3 py-2 sm:px-4 rounded-xl text-sm font-medium border transition-colors"
                  style={{
                    borderColor: theme.glass.border,
                    color: theme.colors.textPrimary,
                    background: theme.glass.background,
                  }}
                >
                  Sign in
                </button>
              </Link>
              <Link href="/signup">
                <button
                  className="px-4 py-2 sm:px-5 rounded-xl text-sm font-bold shadow-lg transition-transform hover:-translate-y-0.5"
                  style={{
                    background: theme.buttons.primary.background,
                    color: theme.buttons.primary.color,
                  }}
                >
                  Get Started
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile: Competitions / Community / Meetings (same as HomeNav) */}
      <nav
        className="md:hidden flex gap-1 overflow-x-auto py-2 px-4 rounded-b-2xl"
        style={{
          background: theme.glass.background,
          borderLeft: theme.glass.border,
          borderRight: theme.glass.border,
          borderBottom: theme.glass.border,
        }}
      >
        {primaryLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-90"
            style={{ color: theme.colors.textSecondary }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
