'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { theme } from '@/lib/theme'
import { toast } from '@/components/ui/ToasterProvider'
import Image from 'next/image'
import Link from 'next/link'

type Registration = {
  id: number
  status: string
  paymentStatus: string
  transactionId: string | null
  paymentSlipUrls: string[]
  rejectionReason: string | null
  internalNotes: string | null
  createdAt: string
  user: {
    id: number
    email: string
    name: string | null
    snowPoints: number
  }
  competition: {
    id: number
    title: string
    category: string
    deadline: string
    prize: string
  }
}

type PaymentDetailModalProps = {
  registration: Registration | null
  onClose: () => void
  onVerify: (registrationId: number, action: 'approve' | 'reject', rejectionReason?: string, internalNotes?: string) => Promise<void>
}

function PaymentDetailModal({ registration, onClose, onVerify }: PaymentDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [rejectionReason, setRejectionReason] = useState(registration?.rejectionReason || '')
  const [internalNotes, setInternalNotes] = useState(registration?.internalNotes || '')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const rejectionReasonRef = useRef<HTMLTextAreaElement>(null)
  const errorBannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (registration) {
      setRejectionReason(registration.rejectionReason || '')
      setInternalNotes(registration.internalNotes || '')
    }
  }, [registration?.id, registration?.rejectionReason, registration?.internalNotes])

  if (!registration) return null

  const handleVerify = async (action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectionReason.trim()) {
      setError('Please enter a reason for rejection before setting status to Rejected.')
      errorBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      rejectionReasonRef.current?.focus()
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      await onVerify(registration.id, action, rejectionReason.trim() || undefined, internalNotes.trim() || undefined)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to process payment')
    } finally {
      setIsProcessing(false)
    }
  }

  const currentImage = registration.paymentSlipUrls[selectedImageIndex]
  const isImage = currentImage && /\.(jpg|jpeg|png|gif|webp)$/i.test(currentImage)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl backdrop-blur-xl"
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
          borderRadius: theme.radius.xl,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 p-6 border-b backdrop-blur-xl" style={{ borderColor: 'var(--glass-border)', background: 'var(--glass-bg)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2
                className="text-2xl font-semibold mb-1"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Payment Verification
              </h2>
              <p
                className="text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {registration.competition.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'var(--color-text-primary)',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div
              ref={errorBannerRef}
              role="alert"
              className="p-4 rounded-xl text-sm font-medium flex items-start gap-3"
              style={{
                background: `${theme.colors.danger}18`,
                color: theme.colors.danger,
                border: `1px solid ${theme.colors.danger}`,
              }}
            >
              <span className="shrink-0" aria-hidden>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* User & Competition Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p
                className="text-xs uppercase tracking-wider mb-2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                User Information
              </p>
              <div className="space-y-1">
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {registration.user.name || registration.user.email}
                </p>
                <p
                  className="text-xs"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {registration.user.email}
                </p>
                <p
                  className="text-xs"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  ❄️ {registration.user.snowPoints} Snow Points
                </p>
              </div>
            </div>

            <div>
              <p
                className="text-xs uppercase tracking-wider mb-2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Competition Details
              </p>
              <div className="space-y-1">
                <Link
                  href={`/competitions/${registration.competition.id}`}
                  className="text-sm font-medium hover:underline block"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {registration.competition.title}
                </Link>
                <p
                  className="text-xs"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {registration.competition.category}
                </p>
                <p
                  className="text-xs"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Prize: {registration.competition.prize}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction ID */}
          {registration.transactionId && (
            <div>
              <p
                className="text-xs uppercase tracking-wider mb-2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Transaction ID
              </p>
              <p
                className="text-sm font-mono p-3 rounded-lg"
                style={{
                  background: 'var(--input-bg)',
                  color: 'var(--input-text)',
                  border: 'var(--input-border)',
                }}
              >
                {registration.transactionId}
              </p>
            </div>
          )}

          {/* Payment Slips */}
          <div>
            <p
              className="text-xs uppercase tracking-wider mb-3"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Payment Slips ({registration.paymentSlipUrls.length})
            </p>

            {registration.paymentSlipUrls.length > 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {registration.paymentSlipUrls.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx ? 'ring-2' : ''
                    }`}
                    style={{
                      borderColor: selectedImageIndex === idx ? 'var(--color-glacier-500)' : 'var(--glass-border)',
                    }}
                  >
                    {/\.(jpg|jpeg|png|gif|webp)$/i.test(url) ? (
                      <Image
                        src={url}
                        alt={`Slip ${idx + 1}`}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--input-bg)' }}>
                        <span className="text-2xl">📄</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Main Image Display */}
            <div className="relative w-full rounded-xl overflow-hidden border" style={{ borderColor: 'var(--glass-border)', minHeight: '400px' }}>
              {isImage ? (
                <div
                  className={`relative w-full ${isZoomed ? 'h-auto' : 'h-[500px]'} cursor-zoom-in`}
                  onClick={() => setIsZoomed(!isZoomed)}
                >
                  {isZoomed ? (
                    <Image
                      src={currentImage}
                      alt="Payment slip"
                      width={800}
                      height={500}
                      className="w-full h-auto object-contain"
                      unoptimized
                    />
                  ) : (
                    <Image
                      src={currentImage}
                      alt="Payment slip"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 800px"
                      unoptimized
                    />
                  )}
                </div>
              ) : (
                <div className="w-full h-[500px] flex items-center justify-center" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-center">
                    <span className="text-6xl mb-4 block">📄</span>
                    <a
                      href={currentImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105"
                      style={{
                        background: theme.buttons.primary.background,
                        color: theme.buttons.primary.color,
                        borderRadius: theme.buttons.primary.radius,
                      }}
                    >
                      View PDF
                    </a>
                  </div>
                </div>
              )}
            </div>
            {isImage && (
              <p
                className="text-xs text-center mt-2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Click image to {isZoomed ? 'zoom out' : 'zoom in'}
              </p>
            )}
          </div>

          {/* Form section: Update status */}
          <div className="pt-2 border-t" style={{ borderColor: 'var(--glass-border)' }}>
            <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              Update status
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
              Approve or reject this payment. If you reject, enter a reason (the participant will see it in the email).
            </p>
          </div>

          {/* Internal Notes */}
          <div>
            <label
              htmlFor="internalNotes"
              className="block mb-2 text-sm font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Internal notes (admin only)
            </label>
            <textarea
              id="internalNotes"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Add internal notes about this payment..."
              rows={3}
              className="w-full px-4 py-2.5 text-sm transition-all duration-300 focus:outline-none resize-none"
              style={{
                background: 'var(--input-bg)',
                border: 'var(--input-border)',
                borderRadius: theme.inputs.radius,
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

          {/* Rejection reason: required when rejecting */}
          <div>
            <label
              htmlFor="rejectionReason"
              className="block mb-2 text-sm font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Rejection reason <span className="font-normal text-red-500 dark:text-red-400">(required if you click Reject)</span>
            </label>
            <textarea
              ref={rejectionReasonRef}
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value)
                if (error) setError(null)
              }}
              placeholder="e.g. Payment slip unclear, wrong amount..."
              rows={2}
              className="w-full px-4 py-2.5 text-sm transition-all focus:outline-none resize-none"
              style={{
                background: 'var(--input-bg)',
                border: 'var(--input-border)',
                borderRadius: theme.inputs.radius,
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
              aria-invalid={!!error}
              aria-describedby={error && error.includes('enter a reason') ? 'rejection-error' : undefined}
            />
            {error && error.includes('enter a reason') && (
              <p id="rejection-error" className="mt-2 text-sm font-medium" style={{ color: theme.colors.danger }}>
                Please enter a reason for rejection before setting status to Rejected.
              </p>
            )}
          </div>

          {/* Current status pill */}
          {registration.paymentStatus !== 'pending' && (
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
              style={{
                background:
                  registration.paymentStatus === 'approved'
                    ? `${theme.colors.success}22`
                    : `${theme.colors.danger}22`,
                color: registration.paymentStatus === 'approved' ? theme.colors.success : theme.colors.danger,
                border: `1px solid ${registration.paymentStatus === 'approved' ? theme.colors.success : theme.colors.danger}`,
              }}
            >
              {registration.paymentStatus === 'approved' ? '✓ Verified' : '✗ Rejected'}
              {registration.rejectionReason && (
                <span className="opacity-90 max-w-[200px] truncate" title={registration.rejectionReason}>
                  {' · '}{registration.rejectionReason}
                </span>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div
            className="pt-6 mt-2 border-t flex flex-col sm:flex-row gap-3"
            style={{ borderColor: 'var(--glass-border)' }}
          >
            <button
              type="button"
              onClick={() => handleVerify('approve')}
              disabled={isProcessing}
              className="flex-1 min-w-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none"
              style={{
                background: theme.colors.success,
                color: '#fff',
                boxShadow: theme.buttons.primary.shadow,
              }}
            >
              {isProcessing ? (
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                '✓ Approve payment'
              )}
            </button>
            <button
              type="button"
              onClick={() => handleVerify('reject')}
              disabled={isProcessing}
              className="flex-1 min-w-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none border-2"
              style={{
                background: 'transparent',
                color: theme.colors.danger,
                borderColor: theme.colors.danger,
              }}
            >
              {isProcessing ? (
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                'Reject payment'
              )}
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
            Status change will be saved and the participant will receive an email.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AdminPaymentsPage() {
  const { user, loading: authLoading } = useAuth()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [filters, setFilters] = useState({
    paymentStatus: 'pending',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
  })
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    if (!authLoading && user) {
      fetchRegistrations()
    }
  }, [authLoading, user, filters])

  const fetchRegistrations = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus)
      if (filters.search.trim()) params.append('search', filters.search.trim())
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

      const response = await fetch(`/api/admin/registrations?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch registrations')
      const data = await response.json()
      setRegistrations(data.registrations || [])
    } catch (err: any) {
      console.error('Error fetching registrations:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (
    registrationId: number,
    action: 'approve' | 'reject',
    rejectionReason?: string,
    internalNotes?: string
  ) => {
    try {
      const response = await fetch(`/api/admin/registrations/${registrationId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          rejectionReason,
          internalNotes,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify payment')
      }

      if (action === 'approve') {
        if (data.emailSent) {
          toast.success('Payment verified and notification email sent to participant.')
        } else if (data.emailError) {
          toast.warning(`Payment verified, but the notification email could not be sent. ${data.emailError}`)
        } else {
          toast.success('Payment verified successfully.')
        }
      } else {
        toast.success('Payment rejected.')
      }

      // Refresh registrations
      await fetchRegistrations()
      setSelectedRegistration(null)
    } catch (error: any) {
      throw error
    }
  }

  const escapeCsvCell = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return ''
    const s = String(value)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }

  const downloadPaymentsCsv = () => {
    const headers = [
      'Registration ID',
      'User ID',
      'User Email',
      'User Name',
      'User Snow Points',
      'Competition ID',
      'Competition Title',
      'Competition Category',
      'Competition Deadline',
      'Competition Prize',
      'Registration Status',
      'Payment Status',
      'Transaction ID',
      'Rejection Reason',
      'Internal Notes',
      'Payment Slip Count',
      'Payment Slip URLs',
      'Created At',
    ]
    const rows = registrations.map((r) => [
      r.id,
      r.user.id,
      r.user.email,
      r.user.name ?? '',
      r.user.snowPoints,
      r.competition.id,
      r.competition.title,
      r.competition.category,
      r.competition.deadline,
      r.competition.prize,
      r.status,
      r.paymentStatus,
      r.transactionId ?? '',
      r.rejectionReason ?? '',
      r.internalNotes ?? '',
      r.paymentSlipUrls?.length ?? 0,
      (r.paymentSlipUrls ?? []).join('; '),
      r.createdAt,
    ])
    const csvContent = [
      headers.map(escapeCsvCell).join(','),
      ...rows.map((row) => row.map(escapeCsvCell).join(',')),
    ].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments-export-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (authLoading || loading) {
    return (
      <div className="p-8">
        <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">💳</span>
            <h1
              className="text-3xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Payment Verification Panel
            </h1>
          </div>
          <p
            className="text-base"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Review and verify payment slips for competition registrations
          </p>
        </div>

        {/* Filters, Search & Sort */}
        <div
          className="mb-6 p-5 rounded-2xl backdrop-blur-xl"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
            borderRadius: theme.radius.lg,
          }}
        >
          <div className="flex flex-wrap gap-4 items-end">
            <label
              className="text-sm font-medium shrink-0"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Status:
            </label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
              className="px-4 py-2 text-sm min-w-[140px]"
              style={{
                background: 'var(--input-bg)',
                border: 'var(--input-border)',
                borderRadius: theme.inputs.radius,
                color: 'var(--input-text)',
              }}
            >
              <option value="">All Payments</option>
              <option value="pending">Pending</option>
              <option value="approved">Verified</option>
              <option value="rejected">Rejected</option>
            </select>

            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    setFilters((f) => ({ ...f, search: searchInput.trim() }))
                  }
                }}
                placeholder="Search by email, name, competition, transaction ID..."
                className="px-4 py-2 text-sm w-64 max-w-full"
                style={{
                  background: 'var(--input-bg)',
                  border: 'var(--input-border)',
                  borderRadius: theme.inputs.radius,
                  color: 'var(--input-text)',
                }}
              />
              <button
                type="button"
                onClick={() => setFilters((f) => ({ ...f, search: searchInput.trim() }))}
                className="px-4 py-2 text-sm font-medium rounded-xl"
                style={{
                  background: theme.buttons.primary.background,
                  color: theme.buttons.primary.color,
                  borderRadius: theme.radius.md,
                }}
              >
                Search
              </button>
            </div>

            <label
              className="text-sm font-medium shrink-0 ml-auto sm:ml-0"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Sort by:
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value }))}
              className="px-4 py-2 text-sm min-w-[160px]"
              style={{
                background: 'var(--input-bg)',
                border: 'var(--input-border)',
                borderRadius: theme.inputs.radius,
                color: 'var(--input-text)',
              }}
            >
              <option value="createdAt">Date</option>
              <option value="paymentStatus">Payment status</option>
              <option value="status">Registration status</option>
              <option value="userEmail">User email</option>
              <option value="competitionTitle">Competition title</option>
            </select>
            <select
              value={filters.sortOrder}
              onChange={(e) => setFilters((f) => ({ ...f, sortOrder: e.target.value as 'asc' | 'desc' }))}
              className="px-4 py-2 text-sm min-w-[120px]"
              style={{
                background: 'var(--input-bg)',
                border: 'var(--input-border)',
                borderRadius: theme.inputs.radius,
                color: 'var(--input-text)',
              }}
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>

            <div className="flex items-center gap-3 ml-auto">
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {registrations.length} {registrations.length === 1 ? 'payment' : 'payments'}
              </span>
              <button
                type="button"
                onClick={downloadPaymentsCsv}
                disabled={registrations.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                style={{
                  background: theme.buttons.primary.background,
                  color: theme.buttons.primary.color,
                  borderRadius: theme.radius.md,
                }}
              >
                <span aria-hidden>📥</span>
                Download CSV
              </button>
            </div>
          </div>
        </div>

        {/* Payments List */}
        {registrations.length === 0 ? (
          <div
            className="p-10 text-center rounded-3xl backdrop-blur-xl"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--glass-shadow)',
              borderRadius: theme.radius.xl,
            }}
          >
            <div className="text-6xl mb-4">💳</div>
            <h2
              className="text-lg font-semibold tracking-tight mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              No Payments Found
            </h2>
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {filters.paymentStatus
                ? `No ${filters.paymentStatus} payments at the moment.`
                : 'No payments found.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {registrations.map((registration) => {
              const hasSlips = registration.paymentSlipUrls.length > 0
              const firstSlip = hasSlips ? registration.paymentSlipUrls[0] : null
              const isImage = firstSlip && /\.(jpg|jpeg|png|gif|webp)$/i.test(firstSlip)

              return (
                <div
                  key={registration.id}
                  onClick={() => setSelectedRegistration(registration)}
                  className="p-4 rounded-2xl backdrop-blur-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    boxShadow: 'var(--glass-shadow)',
                    borderRadius: theme.radius.lg,
                  }}
                >
                  {/* Payment Slip Preview */}
                  {hasSlips && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4 border" style={{ borderColor: 'var(--glass-border)' }}>
                      {isImage ? (
                        <Image
                          src={firstSlip}
                          alt="Payment slip"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--input-bg)' }}>
                          <span className="text-4xl">📄</span>
                        </div>
                      )}
                      {registration.paymentSlipUrls.length > 1 && (
                        <div
                          className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold backdrop-blur-sm"
                          style={{
                            background: 'rgba(0, 0, 0, 0.7)',
                            color: '#ffffff',
                          }}
                        >
                          +{registration.paymentSlipUrls.length - 1}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Info */}
                  <div className="space-y-2">
                    <div>
                      <p
                        className="text-xs uppercase tracking-wider mb-1"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        User
                      </p>
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {registration.user.name || registration.user.email}
                      </p>
                    </div>

                    <div>
                      <p
                        className="text-xs uppercase tracking-wider mb-1"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        Competition
                      </p>
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {registration.competition.title}
                      </p>
                    </div>

                    {registration.transactionId && (
                      <div>
                        <p
                          className="text-xs uppercase tracking-wider mb-1"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          Transaction ID
                        </p>
                        <p
                          className="text-xs font-mono truncate"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {registration.transactionId}
                        </p>
                      </div>
                    )}

                    <div>
                      <p
                        className="text-xs uppercase tracking-wider mb-1"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        Status
                      </p>
                      <p
                        className="text-sm font-medium"
                        style={{
                          color:
                            registration.paymentStatus === 'approved'
                              ? theme.colors.success
                              : registration.paymentStatus === 'rejected'
                              ? theme.colors.danger
                              : theme.colors.warning,
                        }}
                      >
                        {registration.paymentStatus === 'pending'
                          ? 'Pending'
                          : registration.paymentStatus === 'approved'
                          ? 'Verified'
                          : 'Rejected'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                    <p
                      className="text-xs text-center"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Click to view details →
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Payment Detail Modal */}
      {selectedRegistration && (
        <PaymentDetailModal
          registration={selectedRegistration}
          onClose={() => setSelectedRegistration(null)}
          onVerify={handleVerify}
        />
      )}
    </div>
  )
}


