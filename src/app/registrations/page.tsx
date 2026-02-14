'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { HomeNav } from '@/components/home/HomeNav'
import { HomeFooter } from '@/components/home/HomeFooter'
import { theme } from '@/lib/theme'
import { Snowfall } from '@/components/ui/Snowfall'
import Image from 'next/image'
import Link from 'next/link'

type Registration = {
  id: number
  status: string
  paymentStatus: string
  transactionId: string | null
  paymentSlipUrls: string[]
  rejectionReason: string | null
  createdAt: string
  competition: {
    id: number
    title: string
    description: string
    category: string
    deadline: string
    prize: string
    images: string[]
    status: string
  }
}

export default function RegistrationsPage() {
  const { user, loading: authLoading } = useAuth()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingSlip, setUploadingSlip] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && user) {
      fetchRegistrations()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [authLoading, user])

  const fetchRegistrations = async () => {
    try {
      const response = await fetch('/api/registrations')
      if (!response.ok) throw new Error('Failed to fetch registrations')
      const data = await response.json()
      setRegistrations(data.registrations || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load registrations')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (registrationId: number, file: File) => {
    setUploadingSlip(registrationId)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/registrations/${registrationId}/upload-slip`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload payment slip')
      }

      // Refresh registrations
      await fetchRegistrations()
    } catch (err: any) {
      setError(err.message || 'Failed to upload payment slip')
    } finally {
      setUploadingSlip(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen relative" style={{ backgroundColor: 'var(--background)' }}>
        <Snowfall />
        <HomeNav />
        <main className="py-10 sm:py-12 relative z-10 flex items-center justify-center">
          <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
        </main>
        <HomeFooter />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen relative" style={{ backgroundColor: 'var(--background)' }}>
        <Snowfall />
        <HomeNav />
        <main className="py-10 sm:py-12 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="p-10 text-center rounded-3xl backdrop-blur-xl"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                boxShadow: 'var(--glass-shadow)',
                borderRadius: theme.radius.xl,
              }}
            >
              <div className="text-6xl mb-4">❄️</div>
              <h2
                className="text-lg font-semibold tracking-tight mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Please Login
              </h2>
              <p
                className="text-sm mb-4"
                style={{ color: 'var(--color-text-muted)' }}
              >
                You need to be logged in to view your registrations.
              </p>
              <Link
                href="/login"
                className="inline-block px-6 py-3 text-sm font-medium transition-all duration-300 hover:scale-105"
                style={{
                  background: theme.buttons.primary.background,
                  color: theme.buttons.primary.color,
                  borderRadius: theme.buttons.primary.radius,
                  boxShadow: theme.buttons.primary.shadow,
                }}
              >
                Login
              </Link>
            </div>
          </div>
        </main>
        <HomeFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--background)' }}>
      <Snowfall />
      <HomeNav />

      <main className="py-10 sm:py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-8 sm:mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">👤</span>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  My Registrations
                </p>
                <h1
                  className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Registration Dashboard
                </h1>
              </div>
            </div>
            <p
              className="mt-3 max-w-[58ch] text-sm sm:text-base"
              style={{ color: 'var(--color-text-muted)' }}
            >
              View all your competition registrations, payment status, and manage your payment slips.
            </p>
          </header>

          {error && (
            <div
              className="mb-6 p-4 rounded-lg"
              style={{
                background: `${theme.colors.danger}20`,
                color: theme.colors.danger,
                border: `1px solid ${theme.colors.danger}`,
              }}
            >
              {error}
            </div>
          )}

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
              <div className="text-6xl mb-4">❄️</div>
              <h2
                className="text-lg font-semibold tracking-tight mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                No Registrations Yet
              </h2>
              <p
                className="text-sm mb-4"
                style={{ color: 'var(--color-text-muted)' }}
              >
                You haven't registered for any competitions yet.
              </p>
              <Link
                href="/competitions"
                className="inline-block px-6 py-3 text-sm font-medium transition-all duration-300 hover:scale-105"
                style={{
                  background: theme.buttons.primary.background,
                  color: theme.buttons.primary.color,
                  borderRadius: theme.buttons.primary.radius,
                  boxShadow: theme.buttons.primary.shadow,
                }}
              >
                Browse Competitions
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {registrations.map((registration) => {
                const deadline = new Date(registration.competition.deadline)
                const isExpired = deadline < new Date()
                const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

                return (
                  <div
                    key={registration.id}
                    className="p-6 rounded-3xl backdrop-blur-xl"
                    style={{
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--glass-border)',
                      boxShadow: 'var(--glass-shadow)',
                      borderRadius: theme.radius.xl,
                    }}
                  >
                    <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
                      {/* Competition Image */}
                      <div className="relative h-48 w-full overflow-hidden rounded-xl">
                        {registration.competition.images?.[0] ? (
                          <Image
                            src={registration.competition.images[0]}
                            alt={registration.competition.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ background: 'var(--glass-bg)' }}
                          >
                            <span className="text-4xl opacity-50">❄️</span>
                          </div>
                        )}
                      </div>

                      {/* Registration Details */}
                      <div className="space-y-4">
                        <div>
                          <Link
                            href={`/competitions/${registration.competition.id}`}
                            className="text-xl font-semibold hover:underline"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {registration.competition.title}
                          </Link>
                          <p
                            className="text-xs uppercase tracking-wider mt-1"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {registration.competition.category}
                          </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          {/* Registration Status */}
                          <div>
                            <p
                              className="text-xs uppercase tracking-wider mb-1"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              Registration Status
                            </p>
                            <p
                              className="text-sm font-medium"
                              style={{
                                color:
                                  registration.status === 'approved'
                                    ? theme.colors.success
                                    : registration.status === 'rejected'
                                    ? theme.colors.danger
                                    : theme.colors.warning,
                              }}
                            >
                              {registration.status === 'pending'
                                ? 'Pending'
                                : registration.status === 'approved'
                                ? 'Approved'
                                : 'Rejected'}
                            </p>
                          </div>

                          {/* Payment Status */}
                          <div>
                            <p
                              className="text-xs uppercase tracking-wider mb-1"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              Payment Status
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
                                ? 'Approved'
                                : 'Rejected'}
                            </p>
                          </div>

                          {/* Transaction ID */}
                          {registration.transactionId && (
                            <div>
                              <p
                                className="text-xs uppercase tracking-wider mb-1"
                                style={{ color: 'var(--color-text-muted)' }}
                              >
                                Transaction ID
                              </p>
                              <p
                                className="text-sm font-mono"
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                {registration.transactionId}
                              </p>
                            </div>
                          )}

                          {/* Deadline */}
                          <div>
                            <p
                              className="text-xs uppercase tracking-wider mb-1"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              Deadline
                            </p>
                            <p
                              className="text-sm"
                              style={{
                                color: isExpired
                                  ? theme.colors.danger
                                  : daysLeft <= 7
                                  ? theme.colors.warning
                                  : 'var(--color-text-secondary)',
                              }}
                            >
                              {isExpired
                                ? 'Expired'
                                : daysLeft === 0
                                ? 'Today'
                                : daysLeft === 1
                                ? 'Tomorrow'
                                : `${daysLeft} days left`}
                            </p>
                            <p
                              className="text-xs mt-1"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              {deadline.toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Rejection Reason */}
                        {registration.paymentStatus === 'rejected' && registration.rejectionReason && (
                          <div
                            className="p-3 rounded-lg"
                            style={{
                              background: `${theme.colors.danger}20`,
                              border: `1px solid ${theme.colors.danger}`,
                            }}
                          >
                            <p
                              className="text-xs uppercase tracking-wider mb-1"
                              style={{ color: theme.colors.danger }}
                            >
                              Rejection Reason
                            </p>
                            <p
                              className="text-sm"
                              style={{ color: theme.colors.danger }}
                            >
                              {registration.rejectionReason}
                            </p>
                          </div>
                        )}

                        {/* Payment Slips */}
                        <div>
                          <p
                            className="text-xs uppercase tracking-wider mb-2"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            Payment Slips
                          </p>
                          {registration.paymentSlipUrls.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {registration.paymentSlipUrls.map((url, idx) => (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:scale-105"
                                  style={{
                                    background: 'var(--color-frost-100)',
                                    color: 'var(--color-glacier-500)',
                                    border: `1px solid var(--color-frost-300)`,
                                    borderRadius: theme.radius.sm,
                                  }}
                                >
                                  View Slip {idx + 1}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <p
                              className="text-sm mb-2"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              No payment slips uploaded yet.
                            </p>
                          )}

                          {/* Upload Payment Slip */}
                          <label
                            className="inline-block cursor-pointer"
                            style={{
                              background: theme.buttons.ghost.background,
                              border: theme.buttons.ghost.border,
                              color: theme.buttons.ghost.color,
                              borderRadius: theme.radius.sm,
                              padding: '8px 16px',
                              fontSize: '12px',
                              fontWeight: '500',
                              transition: 'all 0.3s',
                            }}
                          >
                            {uploadingSlip === registration.id ? 'Uploading...' : 'Upload Payment Slip'}
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              disabled={uploadingSlip === registration.id}
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  handleFileUpload(registration.id, file)
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <HomeFooter />
    </div>
  )
}

