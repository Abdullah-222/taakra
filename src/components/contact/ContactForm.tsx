'use client'

import { useState } from 'react'
import { theme } from '@/lib/theme'

const MESSAGE_MAX = 2000

const categories = [
  { value: '', label: 'Select a topic…' },
  { value: 'registration', label: 'Registration & payments' },
  { value: 'competition', label: 'Competition rules & deadlines' },
  { value: 'technical', label: 'Technical support' },
  { value: 'partnership', label: 'Partnerships & events' },
  { value: 'feedback', label: 'Feedback & suggestions' },
  { value: 'other', label: 'Other' },
]

const inputBase =
  'w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none placeholder:opacity-70'
const inputStyle = {
  background: 'var(--input-bg)',
  border: 'var(--input-border)',
  color: 'var(--input-text)',
}
const focusRing = theme.inputs.focusRing
const focusBorder = theme.inputs.focusBorder

export function ContactForm() {
  const [category, setCategory] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResult(null)
    if (!name.trim() || !email.trim() || !message.trim()) {
      setResult({ error: 'Please fill in name, email, and message (all required).' })
      return
    }
    if (message.length > MESSAGE_MAX) {
      setResult({ error: `Message must be under ${MESSAGE_MAX} characters.` })
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: category || undefined,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          subject: subject.trim() || undefined,
          message: message.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setResult({ error: data.error || 'Something went wrong. Please try again.' })
        return
      }
      setResult({ success: true })
      setCategory('')
      setName('')
      setEmail('')
      setPhone('')
      setSubject('')
      setMessage('')
    } catch {
      setResult({ error: 'Failed to send. Please check your connection and try again.' })
    } finally {
      setSending(false)
    }
  }

  return (
    <form id="contact-form" onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="contact-category"
          className="block text-sm font-semibold mb-2"
          style={{ color: theme.colors.textPrimary }}
        >
          Topic <span style={{ color: theme.colors.danger }}>*</span>
        </label>
        <select
          id="contact-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputBase}
          style={{
            ...inputStyle,
            cursor: 'pointer',
            appearance: 'auto',
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = focusRing
            e.currentTarget.style.border = focusBorder
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.border = 'var(--input-border)'
          }}
        >
          {categories.map((opt) => (
            <option key={opt.value || 'empty'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs" style={{ color: theme.colors.textMuted }}>
          Helps us route your message to the right team.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contact-name"
            className="block text-sm font-semibold mb-2"
            style={{ color: theme.colors.textPrimary }}
          >
            Name <span style={{ color: theme.colors.danger }}>*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className={inputBase}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = focusRing
              e.currentTarget.style.border = focusBorder
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.border = 'var(--input-border)'
            }}
          />
        </div>
        <div>
          <label
            htmlFor="contact-email"
            className="block text-sm font-semibold mb-2"
            style={{ color: theme.colors.textPrimary }}
          >
            Email <span style={{ color: theme.colors.danger }}>*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputBase}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = focusRing
              e.currentTarget.style.border = focusBorder
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.border = 'var(--input-border)'
            }}
          />
          <p className="mt-1.5 text-xs" style={{ color: theme.colors.textMuted }}>
            We&apos;ll reply to this address.
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-phone"
          className="block text-sm font-semibold mb-2"
          style={{ color: theme.colors.textPrimary }}
        >
          Phone <span className="font-normal text-xs" style={{ color: theme.colors.textMuted }}>(optional)</span>
        </label>
        <input
          id="contact-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 234 567 8900"
          className={inputBase}
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = focusRing
            e.currentTarget.style.border = focusBorder
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.border = 'var(--input-border)'
          }}
        />
      </div>

      <div>
        <label
          htmlFor="contact-subject"
          className="block text-sm font-semibold mb-2"
          style={{ color: theme.colors.textPrimary }}
        >
          Subject <span className="font-normal text-xs" style={{ color: theme.colors.textMuted }}>(optional)</span>
        </label>
        <input
          id="contact-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Registration help for Winter Design 2026"
          className={inputBase}
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = focusRing
            e.currentTarget.style.border = focusBorder
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.border = 'var(--input-border)'
          }}
        />
        <p className="mt-1.5 text-xs" style={{ color: theme.colors.textMuted }}>
          A short summary helps us prioritize. Add &quot;Urgent&quot; if time-sensitive.
        </p>
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block text-sm font-semibold mb-2"
          style={{ color: theme.colors.textPrimary }}
        >
          Message <span style={{ color: theme.colors.danger }}>*</span>
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your question or issue in detail. Include competition name, transaction ID, or any error messages if relevant."
          rows={6}
          maxLength={MESSAGE_MAX}
          className={`${inputBase} resize-y min-h-[140px]`}
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = focusRing
            e.currentTarget.style.border = focusBorder
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.border = 'var(--input-border)'
          }}
        />
        <p className="mt-1.5 text-xs flex justify-between" style={{ color: theme.colors.textMuted }}>
          <span>Include competition name or transaction ID when relevant.</span>
          <span className="shrink-0 ml-2">{message.length} / {MESSAGE_MAX}</span>
        </p>
      </div>

      {result && (
        <div
          className="p-4 rounded-xl text-sm font-medium"
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
            : 'Message sent! We\'ll get back to you within 24–48 hours. Check your email (and spam folder). ❄️'}
        </div>
      )}

      <button
        type="submit"
        disabled={sending}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:pointer-events-none disabled:hover:scale-100"
        style={{
          background: theme.buttons.primary.background,
          boxShadow: theme.buttons.primary.shadow,
          borderRadius: theme.radius.md,
        }}
      >
        {sending ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Sending...
          </>
        ) : (
          'Send message ❄️'
        )}
      </button>
    </form>
  )
}
