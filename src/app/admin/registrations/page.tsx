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

export default function AdminRegistrationsPage() {
  const { user, loading: authLoading } = useAuth()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    competitionId: '',
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
      if (filters.status) params.append('status', filters.status)
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus)
      if (filters.competitionId) params.append('competitionId', filters.competitionId)
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
            <span className="text-3xl">📝</span>
            <h1
              className="text-3xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              All Registrations
            </h1>
          </div>
          <p
            className="text-base"
            style={{ color: 'var(--color-text-muted)' }}
          >
            View and manage all competition registrations with transaction IDs
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
          <div className="grid gap-4 sm:grid-cols-3 mb-4">
            <div>
              <label
                className="block mb-2 text-sm font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Registration Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 text-sm"
                style={{
                  background: 'var(--input-bg)',
                  border: 'var(--input-border)',
                  borderRadius: theme.inputs.radius,
                  color: 'var(--input-text)',
                }}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label
                className="block mb-2 text-sm font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Payment Status
              </label>
              <select
                value={filters.paymentStatus}
                onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                className="w-full px-4 py-2 text-sm"
                style={{
                  background: 'var(--input-bg)',
                  border: 'var(--input-border)',
                  borderRadius: theme.inputs.radius,
                  color: 'var(--input-text)',
                }}
              >
                <option value="">All Payment Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label
                className="block mb-2 text-sm font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Competition ID
              </label>
              <input
                type="number"
                value={filters.competitionId}
                onChange={(e) => setFilters({ ...filters, competitionId: e.target.value })}
                placeholder="Filter by competition ID"
                className="w-full px-4 py-2 text-sm"
                style={{
                  background: 'var(--input-bg)',
                  border: 'var(--input-border)',
                  borderRadius: theme.inputs.radius,
                  color: 'var(--input-text)',
                }}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-end border-t pt-4" style={{ borderColor: 'var(--glass-border)' }}>
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
            <label className="text-sm font-medium shrink-0" style={{ color: 'var(--color-text-primary)' }}>
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
          </div>
        </div>

        {/* Registrations List */}
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
              No Registrations Found
            </h2>
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {Object.values(filters).some((f) => f) ? 'Try adjusting your filters.' : 'No registrations yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((registration) => {
              const deadline = new Date(registration.competition.deadline)
              const isExpired = deadline < new Date()

              return (
                <div
                  key={registration.id}
                  className="p-6 rounded-2xl backdrop-blur-xl"
                  style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    boxShadow: 'var(--glass-shadow)',
                    borderRadius: theme.radius.lg,
                  }}
                >
                  <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                    {/* Main Info */}
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
                        {/* User Info */}
                        <div>
                          <p
                            className="text-xs uppercase tracking-wider mb-1"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            User
                          </p>
                          <p
                            className="text-sm font-medium"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {registration.user.name || registration.user.email}
                          </p>
                          <p
                            className="text-xs mt-1"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {registration.user.email}
                          </p>
                          <p
                            className="text-xs mt-1"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            ❄️ {registration.user.snowPoints} Snow Points
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
                                : 'var(--color-text-secondary)',
                            }}
                          >
                            {deadline.toLocaleDateString()}
                          </p>
                          {isExpired && (
                            <p
                              className="text-xs mt-1"
                              style={{ color: theme.colors.danger }}
                            >
                              Expired
                            </p>
                          )}
                        </div>

                        {/* Registered Date */}
                        <div>
                          <p
                            className="text-xs uppercase tracking-wider mb-1"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            Registered On
                          </p>
                          <p
                            className="text-sm"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {new Date(registration.createdAt).toLocaleDateString()}
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
                      {registration.paymentSlipUrls.length > 0 && (
                        <div>
                          <p
                            className="text-xs uppercase tracking-wider mb-2"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            Payment Slips
                          </p>
                          <div className="flex flex-wrap gap-2">
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
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

