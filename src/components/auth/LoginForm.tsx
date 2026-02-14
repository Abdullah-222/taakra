'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { theme } from '../../../theme'

export function LoginForm() {
  const router = useRouter()
  const { theme: currentTheme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Login failed')
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

  const handleGoogleSignIn = async () => {
    setError('')
    setGoogleLoading(true)

    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })

      const firebaseSession = await signInWithPopup(auth, provider)
      const idToken = await firebaseSession.user.getIdToken()

      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || 'Google sign-in failed')
        setGoogleLoading(false)
        return
      }

      await signOut(auth).catch(() => {})

      router.push('/')
      router.refresh()
    } catch (e: any) {
      if (e?.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in was cancelled.')
      } else {
        setError('Google sign-in failed. Please try again.')
      }
      setGoogleLoading(false)
    }
  }

  // Use lighter glow for light theme, stronger for dark
  const glowEffect = currentTheme === 'dark' 
    ? theme.glow.strong 
    : '0 0 20px rgba(54, 158, 255, 0.2)'

  return (
    <div
      className="p-8 lg:p-10 rounded-3xl backdrop-blur-xl transition-all duration-300"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
        borderRadius: theme.radius.xl,
      }}
    >
      <div className="mb-8">
        <p
          className="text-xs uppercase tracking-widest mb-2"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Account Access
        </p>
        <h2
          className="text-3xl font-semibold mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Sign In
        </h2>
        <p
          className="text-sm"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Enter your credentials to access your competitions and Snow Points.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            className="px-4 py-3 rounded-xl text-sm"
            style={{
              background: currentTheme === 'dark' 
                ? 'rgba(239, 68, 68, 0.15)' 
                : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${theme.colors.danger}`,
              color: theme.colors.danger,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading}
          className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02]"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid var(--glass-border)',
            color: 'var(--color-text-primary)',
            borderRadius: theme.radius.lg,
          }}
          onMouseEnter={(e) => {
            if (!loading && !googleLoading) {
              e.currentTarget.style.boxShadow = glowEffect
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {googleLoading ? (
            <span style={{ color: 'var(--color-text-primary)' }}>Connecting...</span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
                <path
                  fill="#EA4335"
                  d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.2 14.7 2.2 12 2.2 6.9 2.2 2.8 6.3 2.8 11.4S6.9 20.6 12 20.6c6.9 0 9.1-4.8 9.1-7.3 0-.5 0-.8-.1-1.1H12z"
                />
              </svg>
              <span style={{ color: 'var(--color-text-primary)' }}>Continue with Google</span>
            </span>
          )}
        </button>

        <div className="flex items-center gap-4 my-6">
          <div
            className="flex-1 h-px"
            style={{ background: 'var(--glass-border)' }}
          />
          <span
            className="text-xs uppercase tracking-wider"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Or
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: 'var(--glass-border)' }}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || googleLoading}
            className="w-full px-4 py-3 text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none"
            style={{
              background: 'var(--input-bg)',
              border: 'var(--input-border)',
              borderRadius: theme.inputs.radius,
              color: 'var(--input-text)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = glowEffect
              e.currentTarget.style.border = `1px solid var(--color-glacier-500)`
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.border = 'var(--input-border)'
            }}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="password"
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Password
            </label>
            <Link
              href="#"
              className="text-xs font-medium transition-colors duration-200 hover:underline"
              style={{ color: 'var(--color-frost-300)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-frost-400)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-frost-300)'
              }}
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading || googleLoading}
            className="w-full px-4 py-3 text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none"
            style={{
              background: 'var(--input-bg)',
              border: 'var(--input-border)',
              borderRadius: theme.inputs.radius,
              color: 'var(--input-text)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = glowEffect
              e.currentTarget.style.border = `1px solid var(--color-glacier-500)`
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.border = 'var(--input-border)'
            }}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full px-4 py-3 text-sm font-semibold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02]"
          style={{
            background: 'var(--color-glacier-500)',
            color: '#ffffff',
            borderRadius: theme.buttons.primary.radius,
          }}
          onMouseEnter={(e) => {
            if (!loading && !googleLoading) {
              e.currentTarget.style.boxShadow = glowEffect
              e.currentTarget.style.background = 'var(--color-glacier-600)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.background = 'var(--color-glacier-500)'
          }}
        >
          {loading ? 'Signing in... ❄️' : 'Sign In ❄️'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--glass-border)' }}>
        <p
          className="text-sm text-center"
          style={{ color: 'var(--color-text-muted)' }}
        >
          New to Taakra?{' '}
          <Link
            href="/signup"
            className="font-semibold transition-colors duration-200 hover:underline"
            style={{ color: 'var(--color-frost-300)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-frost-400)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-frost-300)'
            }}
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
