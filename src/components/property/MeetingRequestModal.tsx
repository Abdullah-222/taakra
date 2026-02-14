'use client'

import { FormEvent, useState } from 'react'
import { toast } from '@/components/ui/ToasterProvider'

type MeetingRequestModalProps = {
  propertyId: number
  propertyTitle: string
  isOpen: boolean
  onClose: () => void
}

export function MeetingRequestModal({
  propertyId,
  propertyTitle,
  isOpen,
  onClose,
}: MeetingRequestModalProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/meeting-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          email: email.trim(),
          name: name.trim() || null,
          message: message.trim() || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      toast.success('Meeting request submitted. You will receive a link by email once approved.')
      setEmail('')
      setName('')
      setMessage('')
      onClose()
    } catch (error: unknown) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit meeting request')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="surface-card w-full max-w-lg p-6 sm:p-7">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              Meeting Request
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Schedule Video Meeting</h2>
          </div>
          <button onClick={onClose} className="btn-secondary h-8 w-8 px-0 text-sm" aria-label="Close">
            x
          </button>
        </div>

        <p className="mb-5 text-sm leading-relaxed text-[color:var(--muted)]">
          Submit your details for <span className="font-medium text-[color:var(--foreground)]">{propertyTitle}</span>. The admin team will review and share a secure meeting link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-clean w-full px-3 py-2.5 text-sm"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-clean w-full px-3 py-2.5 text-sm"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Message (Optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="input-clean w-full px-3 py-2.5 text-sm"
              placeholder="Questions or preferred time"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary w-full px-4 py-2.5 text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full px-4 py-2.5 text-sm disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
