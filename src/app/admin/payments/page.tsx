'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { theme } from '@/lib/theme'
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
  const [rejectionReason, setRejectionReason] = useState('')
  const [internalNotes, setInternalNotes] = useState(registration?.internalNotes || '')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!registration) return null

  const handleVerify = async (action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectionReason.trim()) {
      setError('Rejection reason is required')
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
              className="p-3 rounded-lg text-sm"
              style={{
                background: `${theme.colors.danger}20`,
                color: theme.colors.danger,
                border: `1px solid ${theme.colors.danger}`,
              }}
            >
              {error}
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
                      ringColor: 'var(--color-glacier-500)',
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
                  <Image
                    src={currentImage}
                    alt="Payment slip"
                    fill={!isZoomed}
                    width={isZoomed ? undefined : 800}
                    height={isZoomed ? undefined : 500}
                    className={`object-contain ${isZoomed ? 'w-full h-auto' : ''}`}
                    unoptimized
                  />
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

          {/* Internal Notes */}
          <div>
            <label
              htmlFor="internalNotes"
              className="block mb-2 text-sm font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Internal Notes (Admin Only)
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

          {/* Rejection Reason (if rejecting) */}
          {registration.paymentStatus === 'pending' && (
            <div>
              <label
                htmlFor="rejectionReason"
                className="block mb-2 text-sm font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Rejection Reason (Required for rejection)
              </label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection (will be shown to user)..."
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
          )}

          {/* Action Buttons */}
          {registration.paymentStatus === 'pending' && (
            <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
              <button
                onClick={() => handleVerify('approve')}
                disabled={isProcessing}
                className="flex-1 px-6 py-3 text-sm font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: theme.colors.success,
                  color: '#ffffff',
                  borderRadius: theme.buttons.primary.radius,
                }}
              >
                {isProcessing ? 'Processing...' : '✓ Verify Payment'}
              </button>
              <button
                onClick={() => handleVerify('reject')}
                disabled={isProcessing}
                className="flex-1 px-6 py-3 text-sm font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: theme.colors.danger,
                  color: '#ffffff',
                  borderRadius: theme.buttons.primary.radius,
                }}
              >
                {isProcessing ? 'Processing...' : '✗ Reject Payment'}
              </button>
            </div>
          )}

          {/* Current Status */}
          {registration.paymentStatus !== 'pending' && (
            <div
              className="p-4 rounded-lg"
              style={{
                background:
                  registration.paymentStatus === 'approved'
                    ? `${theme.colors.success}20`
                    : `${theme.colors.danger}20`,
                border: `1px solid ${
                  registration.paymentStatus === 'approved' ? theme.colors.success : theme.colors.danger
                }`,
              }}
            >
              <p
                className="text-sm font-medium mb-2"
                style={{
                  color:
                    registration.paymentStatus === 'approved' ? theme.colors.success : theme.colors.danger,
                }}
              >
                Payment Status: {registration.paymentStatus === 'approved' ? 'Verified' : 'Rejected'}
              </p>
              {registration.rejectionReason && (
                <p
                  className="text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <strong>Reason:</strong> {registration.rejectionReason}
                </p>
              )}
            </div>
          )}
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
    paymentStatus: 'pending', // Default to pending
  })

  useEffect(() => {
    if (!authLoading && user) {
      fetchRegistrations()
    }
  }, [authLoading, user, filters])

  const fetchRegistrations = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus)

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

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to verify payment')
      }

      // Refresh registrations
      await fetchRegistrations()
      setSelectedRegistration(null)
    } catch (error: any) {
      throw error
    }
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

        {/* Filters */}
        <div
          className="mb-6 p-4 rounded-2xl backdrop-blur-xl"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
            borderRadius: theme.radius.lg,
          }}
        >
          <div className="flex gap-4 items-center">
            <label
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Filter by Status:
            </label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
              className="px-4 py-2 text-sm"
              style={{
                background: 'var(--input-bg)',
                border: 'var(--input-border)',
                borderRadius: theme.inputs.radius,
                color: 'var(--input-text)',
              }}
            >
              <option value="">All Payments</option>
              <option value="pending">Pending Payments</option>
              <option value="approved">Verified Payments</option>
              <option value="rejected">Rejected Payments</option>
            </select>
            <div className="ml-auto text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {registrations.length} {registrations.length === 1 ? 'payment' : 'payments'}
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

