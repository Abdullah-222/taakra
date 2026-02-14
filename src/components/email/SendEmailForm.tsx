'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { theme } from '@/lib/theme'

export function SendEmailForm() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [subject, setSubject] = useState('')
  const [html, setHtml] = useState('')
  const [to, setTo] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ error?: string; data?: { id?: string } } | null>(null)

  if (authLoading) {
    return (
      <div
        className="rounded-2xl p-12 text-center"
        style={{
          background: theme.glass.background,
          border: theme.glass.border,
          boxShadow: theme.glass.shadow,
          color: theme.colors.textMuted,
        }}
      >
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
        <p className="mt-3 text-sm">Loading...</p>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setResult(null)
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, html, to: to || user.email }),
      })
      const data = await response.json()
      setResult(data)
      if (response.ok) {
        setSubject('')
        setHtml('')
        setTo('')
      }
    } catch {
      setResult({ error: 'Failed to send email' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: theme.glass.background,
        border: theme.glass.border,
        boxShadow: theme.glass.shadow,
      }}
    >
      {/* Header */}
      <div
        className="p-6 sm:p-8 border-b"
        style={{ borderColor: 'var(--glass-border)' }}
      >
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl" aria-hidden>✉️</span>
          <h1 className="text-2xl font-bold" style={{ color: theme.colors.textPrimary }}>
            Send email
          </h1>
        </div>
        <p className="text-sm mt-1" style={{ color: theme.colors.textMuted }}>
          Send a formatted email via Resend. Leave recipient blank to send to your own address.
        </p>
      </div>

      <form onSubmit={handleSend} className="p-6 sm:p-8 space-y-5">
        <div>
          <label htmlFor="to" className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
            Recipient <span className="font-normal opacity-70">(optional)</span>
          </label>
          <input
            id="to"
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder={user.email}
            className="w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none"
            style={{
              background: 'var(--input-bg)',
              border: 'var(--input-border)',
              color: 'var(--input-text)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = theme.inputs.focusRing
              e.currentTarget.style.border = theme.inputs.focusBorder
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.border = 'var(--input-border)'
            }}
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
            Subject
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="Email subject"
            className="w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none"
            style={{
              background: 'var(--input-bg)',
              border: 'var(--input-border)',
              color: 'var(--input-text)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = theme.inputs.focusRing
              e.currentTarget.style.border = theme.inputs.focusBorder
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.border = 'var(--input-border)'
            }}
          />
        </div>

        <div>
          <label htmlFor="html" className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
            HTML content
          </label>
          <textarea
            id="html"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            required
            rows={10}
            className="w-full px-4 py-3 rounded-xl text-sm font-mono transition-all focus:outline-none resize-y min-h-[200px]"
            style={{
              background: 'var(--input-bg)',
              border: 'var(--input-border)',
              color: 'var(--input-text)',
            }}
            placeholder="<p>Your HTML email content</p>"
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = theme.inputs.focusRing
              e.currentTarget.style.border = theme.inputs.focusBorder
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.border = 'var(--input-border)'
            }}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={sending}
            className="flex-1 min-w-0 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:pointer-events-none"
            style={{
              background: theme.buttons.primary.background,
              boxShadow: theme.buttons.primary.shadow,
            }}
          >
            {sending ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              'Send email'
            )}
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all border shrink-0"
            style={{
              background: theme.glass.background,
              border: theme.glass.border,
              color: theme.colors.textSecondary,
            }}
          >
            ← Cancel
          </Link>
        </div>
      </form>

      {result && (
        <div
          className="mx-6 sm:mx-8 mb-6 sm:mb-8 p-4 rounded-xl text-sm font-medium"
          style={
            result.error
              ? {
                  background: `${theme.colors.danger}18`,
                  border: `1px solid ${theme.colors.danger}`,
                  color: theme.colors.danger,
                }
              : {
                  background: `${theme.colors.success}18`,
                  border: `1px solid ${theme.colors.success}`,
                  color: theme.colors.success,
                }
          }
        >
          {result.error
            ? result.error
            : `Email sent${result.data?.id ? ` (ID: ${result.data.id})` : ''}`}
        </div>
      )}
    </div>
  )
}
