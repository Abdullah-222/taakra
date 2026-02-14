'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { theme } from '@/lib/theme'
import { useAuth } from '@/hooks/useAuth'
import { UserNotificationsBell } from '@/components/notifications/UserNotificationsBell'

const primaryLinks = [
  { href: '/', label: 'Home' },
  { href: '/competitions', label: 'Competitions' },
  { href: '/chat', label: 'Community' },
  { href: '/meeting', label: 'Meetings' },
  { href: '/support', label: 'Support' },
  { href: '/registrations', label: 'Registrations' },
  { href: '/contact', label: 'Contact' },
]

export function Navbar() {
  const { theme: currentTheme, setTheme } = useTheme()
  const { user, loading, logout } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY
          setIsScrolled(scrollY > 20)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleTheme = () => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 flex flex-col gap-0 rounded-xl sm:rounded-2xl overflow-hidden will-change-transform"
      style={{ 
        boxShadow: theme.glass.shadow,
        margin: isScrolled ? '4px 8px' : '8px 16px',
        marginTop: isScrolled ? '4px' : '8px',
        transform: isScrolled ? 'scale(0.98)' : 'scale(1)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <nav
        className={`flex items-center justify-between gap-2 rounded-xl sm:rounded-2xl min-h-0 transition-all duration-300 glass-animated ${
          isScrolled ? 'px-2.5 py-2 sm:px-4 sm:py-3' : 'px-3 py-2.5 sm:px-6 sm:py-4'
        }`}
        style={{
          background: theme.glass.background,
          backdropFilter: theme.glass.blur,
          border: theme.glass.border,
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group min-w-0 shrink">
          <div 
            className="rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg will-change-[width,height,font-size]"
            style={{
              width: isScrolled ? '28px' : '32px',
              height: isScrolled ? '28px' : '32px',
              fontSize: isScrolled ? '16px' : '18px',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            ❄️
          </div>
          <div className="min-w-0">
            <span 
              className="font-bold block leading-tight truncate will-change-[font-size]"
              style={{ 
                color: theme.colors.textPrimary,
                fontSize: isScrolled ? '14px' : '16px',
                transition: 'font-size 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              TAAKRA
            </span>
            <span 
              className="uppercase tracking-wider hidden sm:block truncate will-change-[font-size]"
              style={{ 
                color: theme.colors.textMuted,
                fontSize: isScrolled ? '9px' : '10px',
                transition: 'font-size 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
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
        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0 flex-wrap justify-end">
          {user && <UserNotificationsBell userId={user.id} />}
          {user && String(user.role).toLowerCase() === 'admin' && (
            <Link
              href="/admin"
              className="inline-flex items-center justify-center min-h-[40px] px-2.5 sm:px-3 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium border transition-colors shrink-0"
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
                  className="inline-flex items-center justify-center min-h-[40px] px-2.5 py-2 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium border transition-colors"
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
                className="inline-flex items-center justify-center min-h-[40px] px-3 py-2 sm:px-5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-transform hover:-translate-y-0.5"
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
                  className="inline-flex items-center justify-center min-h-[40px] px-2.5 py-2 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium border transition-colors"
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
                  className="inline-flex items-center justify-center min-h-[40px] px-3 py-2 sm:px-5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-transform hover:-translate-y-0.5"
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

      {/* Mobile: Competitions / Community / Meetings */}
      <nav
        className="md:hidden flex gap-1 overflow-x-auto py-2 px-3 rounded-b-xl sm:rounded-b-2xl scrollbar-thin snap-x snap-mandatory overflow-y-hidden"
        style={{
          background: theme.glass.background,
          borderLeft: theme.glass.border,
          borderRight: theme.glass.border,
          borderBottom: theme.glass.border,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {primaryLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-lg px-3 py-2.5 min-h-[44px] inline-flex items-center text-xs font-medium transition-colors hover:opacity-90 shrink-0 snap-start"
            style={{ color: theme.colors.textSecondary }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
