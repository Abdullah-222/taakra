
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { theme } from '@/lib/theme'

export function SignupForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Signup failed')
        setLoading(false)
        return
      }
      router.push('/')
      router.refresh()
    } catch {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div
      className="p-8 sm:p-10 rounded-[32px] w-full max-w-md mx-auto relative overflow-hidden group shadow-2xl transition-all hover:scale-[1.01]"
      style={{
        background: theme.glass.background,
        border: theme.glass.border,
        backdropFilter: theme.glass.blur,
        boxShadow: theme.glass.shadow,
      }}
    >
      {/* Subtle shine effect on card */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-transparent pointer-events-none opacity-50" />

      <div className="relative z-10 mb-8 text-center">
        <p
          className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
          style={{ color: theme.colors.glacier600 }}
        >
          Start Your Journey
        </p>
        <h2
          className="text-3xl font-bold tracking-tight mb-2"
          style={{ color: theme.colors.textPrimary }}
        >
          Create account
        </h2>
        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
          Unlock premium property tools today.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
        {error && (
          <div
            className="rounded-xl px-4 py-3 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2"
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: `1px solid ${theme.colors.danger}`,
              color: theme.colors.danger,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <div className="group">
          <label
            htmlFor="name"
            className="mb-1.5 block text-xs font-semibold ml-1 uppercase tracking-wide transition-colors group-focus-within:text-blue-500"
            style={{ color: theme.colors.textMuted }}
          >
            Full name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3.5 text-sm transition-all outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            style={{
              background: theme.inputs.background,
              border: theme.inputs.border,
              borderRadius: theme.inputs.radius,
              color: theme.inputs.text,
            }}
            placeholder="John Doe"
          />
        </div>

        <div className="group">
          <label
            htmlFor="email"
            className="mb-1.5 block text-xs font-semibold ml-1 uppercase tracking-wide transition-colors group-focus-within:text-blue-500"
            style={{ color: theme.colors.textMuted }}
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3.5 text-sm transition-all outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            style={{
              background: theme.inputs.background,
              border: theme.inputs.border,
              borderRadius: theme.inputs.radius,
              color: theme.inputs.text,
            }}
            placeholder="you@example.com"
          />
        </div>

        <div className="group">
          <label
            htmlFor="password"
            className="mb-1.5 block text-xs font-semibold ml-1 uppercase tracking-wide transition-colors group-focus-within:text-blue-500"
            style={{ color: theme.colors.textMuted }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3.5 text-sm transition-all outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            style={{
              background: theme.inputs.background,
              border: theme.inputs.border,
              borderRadius: theme.inputs.radius,
              color: theme.inputs.text,
            }}
            placeholder="••••••••"
          />
        </div>

        <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              required
              className="peer h-4 w-4 appearance-none rounded border border-gray-300 bg-white checked:border-blue-500 checked:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <svg
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span style={{ color: theme.colors.textSecondary }}>
            I agree to the{' '}
            <Link href="#" className="font-medium hover:underline" style={{ color: theme.colors.glacier600 }}>
              Terms
            </Link>{' '}
            and{' '}
            <Link href="#" className="font-medium hover:underline" style={{ color: theme.colors.glacier600 }}>
              Privacy Policy
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 text-sm font-bold tracking-wide shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
          style={{
            background: theme.buttons.primary.background,
            color: theme.buttons.primary.color,
            borderRadius: theme.buttons.primary.radius,
            boxShadow: theme.buttons.primary.shadow,
          }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? 'Creating account...' : 'Create Account'}
            {!loading && (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            )}
          </span>
          {/* Button Shine Effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </button>
      </form>

      <div className="relative z-10 mt-8 pt-6 border-t border-gray-100">
        <p className="text-center text-sm" style={{ color: theme.colors.textSecondary }}>
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold hover:underline transition-colors"
            style={{ color: theme.colors.glacier600 }}
          >
            Sign in
          </Link>
        </p>
      </div>

    </div>
  )
}
