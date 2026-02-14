'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export function SendEmailForm() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [subject, setSubject] = useState('')
  const [html, setHtml] = useState('')
  const [to, setTo] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ error?: string; data?: { id?: string } } | null>(null)

  if (authLoading) {
    return <div className="surface-card p-8 text-sm text-[color:var(--muted)]">Loading...</div>
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
    <div className="surface-card p-7 sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
          Communications
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Send Email</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">Dispatch a formatted email through Resend.</p>
      </div>

      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label htmlFor="to" className="mb-1.5 block text-sm font-medium">
            Recipient (optional)
          </label>
          <input
            id="to"
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder={user.email}
            className="input-clean w-full px-3 py-2.5 text-sm"
          />
        </div>

        <div>
          <label htmlFor="subject" className="mb-1.5 block text-sm font-medium">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="input-clean w-full px-3 py-2.5 text-sm"
            placeholder="Email subject"
          />
        </div>

        <div>
          <label htmlFor="html" className="mb-1.5 block text-sm font-medium">
            HTML Content
          </label>
          <textarea
            id="html"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            required
            rows={8}
            className="input-clean w-full px-3 py-2.5 font-mono text-sm"
            placeholder="<p>Your HTML email content</p>"
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="btn-primary w-full px-4 py-2.5 text-sm disabled:opacity-60"
        >
          {sending ? 'Sending...' : 'Send Email'}
        </button>
      </form>

      {result && (
        <div
          className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
            result.error
              ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/35 dark:text-red-300'
              : 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/35 dark:text-emerald-300'
          }`}
        >
          {result.error ? result.error : `Email sent${result.data?.id ? ` (ID: ${result.data.id})` : ''}`}
        </div>
      )}
    </div>
  )
}
