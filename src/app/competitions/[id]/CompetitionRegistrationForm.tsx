'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { theme } from '@/lib/theme'
import Link from 'next/link'
import Image from 'next/image'

type CompetitionRegistrationFormProps = {
  competitionId: number
  competitionTitle: string
  deadline: Date | string
  isExpired: boolean
  userRegistration: {
    id: number
    status: string
    paymentStatus: string
    transactionId: string | null
    createdAt: Date | string
  } | null
  currentUser: {
    id: number
    email: string
    name?: string | null
  } | null
  /** Registration fee in dollars for Stripe (0 = free). Set via NEXT_PUBLIC_STRIPE_REGISTRATION_FEE. */
  registrationFee?: number
}

function pendingFormStorageKey(competitionId: number): string {
  return `competition-stripe-pending-${competitionId}`
}

export function CompetitionRegistrationForm({
  competitionId,
  competitionTitle,
  deadline,
  isExpired,
  userRegistration,
  currentUser,
  registrationFee = 0,
}: CompetitionRegistrationFormProps) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentMethod, setPaymentMethod] = useState<'slip' | 'stripe'>('slip')
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    transactionId: '',
    additionalInfo: '',
  })
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null)
  const [paymentSlipPreview, setPaymentSlipPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [stripeRedirecting, setStripeRedirecting] = useState(false)

  // After Stripe success: complete registration with saved form data
  useEffect(() => {
    const stripeSuccess = searchParams.get('stripe') === 'success'
    const sessionId = searchParams.get('session_id')
    if (!stripeSuccess || !sessionId || success || userRegistration) return

    const raw = typeof window !== 'undefined' ? sessionStorage.getItem(pendingFormStorageKey(competitionId)) : null
    if (!raw) return

    let pending: Record<string, string>
    try {
      pending = JSON.parse(raw)
    } catch {
      return
    }

    const completeStripeRegistration = async () => {
      setError(null)
      setIsSubmitting(true)
      try {
        const response = await fetch(`/api/competitions/${competitionId}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentMethod: 'stripe',
            stripeSessionId: sessionId,
            fullName: pending.fullName ?? '',
            email: pending.email ?? '',
            phone: pending.phone ?? '',
            address: pending.address ?? '',
            city: pending.city ?? '',
            state: pending.state ?? '',
            zipCode: pending.zipCode ?? '',
            country: pending.country ?? '',
            additionalInfo: pending.additionalInfo ?? '',
          }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Failed to complete registration')
        sessionStorage.removeItem(pendingFormStorageKey(competitionId))
        setSuccess(true)
        router.replace(`/competitions/${competitionId}`, { scroll: false })
        router.refresh()
      } catch (e: any) {
        setError(e.message || 'Could not complete registration')
      } finally {
        setIsSubmitting(false)
      }
    }

    completeStripeRegistration()
  }, [competitionId, searchParams, success, userRegistration, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (!['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'].includes(ext || '')) {
        setError('Invalid file type. Please upload JPG, PNG, GIF, WebP or PDF.')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size too large. Maximum size is 5MB.')
        return
      }

      setPaymentSlip(file)
      setError(null)

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPaymentSlipPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setPaymentSlipPreview(null)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!formData.fullName.trim()) {
      setError('Full name is required')
      return
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return
    }
    if (paymentMethod === 'slip') {
      if (!formData.transactionId.trim()) {
        setError('Transaction ID is required for payment slip')
        return
      }
      if (!paymentSlip) {
        setError('Payment slip is required')
        return
      }
    }

    setIsSubmitting(true)

    try {
      const submitFormData = new FormData()
      submitFormData.append('transactionId', formData.transactionId.trim())
      submitFormData.append('fullName', formData.fullName.trim())
      submitFormData.append('email', formData.email.trim())
      submitFormData.append('phone', formData.phone.trim())
      submitFormData.append('address', formData.address.trim())
      submitFormData.append('city', formData.city.trim())
      submitFormData.append('state', formData.state.trim())
      submitFormData.append('zipCode', formData.zipCode.trim())
      submitFormData.append('country', formData.country.trim())
      submitFormData.append('additionalInfo', formData.additionalInfo.trim())
      submitFormData.append('paymentSlip', paymentSlip)

      const response = await fetch(`/api/competitions/${competitionId}/register`, {
        method: 'POST',
        body: submitFormData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register')
      }

      setSuccess(true)
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to register for competition')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div
        className="p-6 rounded-3xl backdrop-blur-xl"
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
          borderRadius: theme.radius.xl,
        }}
      >
        <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div
        className="p-6 rounded-3xl backdrop-blur-xl"
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
          borderRadius: theme.radius.xl,
        }}
      >
        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Register for Competition
        </h2>
        <p
          className="text-sm mb-4"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Please login to register for this competition.
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
          Login to Register
        </Link>
      </div>
    )
  }

  if (isExpired) {
    return (
      <div
        className="p-6 rounded-3xl backdrop-blur-xl"
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
          borderRadius: theme.radius.xl,
        }}
      >
        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Registration Closed
        </h2>
        <p
          className="text-sm"
          style={{ color: 'var(--color-text-muted)' }}
        >
          The registration deadline for this competition has passed.
        </p>
      </div>
    )
  }

  if (userRegistration) {
    return (
      <div
        className="p-6 rounded-3xl backdrop-blur-xl"
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
          borderRadius: theme.radius.xl,
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">❄️</span>
          <h2
            className="text-xl font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Registration Pending
          </h2>
        </div>
        <div className="space-y-3">
          <div>
            <p
              className="text-xs uppercase tracking-wider mb-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Status
            </p>
            <p
              className="text-sm font-medium"
              style={{ color: theme.colors.warning }}
            >
              {userRegistration.status === 'pending' ? 'Pending Approval' : userRegistration.status}
            </p>
          </div>
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
                  userRegistration.paymentStatus === 'approved'
                    ? theme.colors.success
                    : userRegistration.paymentStatus === 'rejected'
                    ? theme.colors.danger
                    : theme.colors.warning,
              }}
            >
              {userRegistration.paymentStatus === 'pending'
                ? 'Pending'
                : userRegistration.paymentStatus === 'approved'
                ? 'Approved'
                : 'Rejected'}
            </p>
          </div>
          {userRegistration.transactionId && (
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
                {userRegistration.transactionId}
              </p>
            </div>
          )}
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
              {new Date(userRegistration.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Link
          href="/registrations"
          className="mt-6 inline-block w-full text-center px-6 py-3 text-sm font-medium transition-all duration-300 hover:scale-105"
          style={{
            background: theme.buttons.primary.background,
            color: theme.buttons.primary.color,
            borderRadius: theme.buttons.primary.radius,
            boxShadow: theme.buttons.primary.shadow,
          }}
        >
          View My Registrations
        </Link>
      </div>
    )
  }

  return (
    <div
      className="p-6 rounded-3xl backdrop-blur-xl"
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
        borderRadius: theme.radius.xl,
      }}
    >
      <h2
        className="text-xl font-semibold mb-2"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Register for Competition
      </h2>
      <p
        className="text-sm mb-6"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Fill in all the required information to complete your registration.
      </p>

      {error && (
        <div
          className="mb-4 p-3 rounded-lg text-sm"
          style={{
            background: `${theme.colors.danger}20`,
            color: theme.colors.danger,
            border: `1px solid ${theme.colors.danger}`,
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="mb-4 p-3 rounded-lg text-sm"
          style={{
            background: `${theme.colors.success}20`,
            color: theme.colors.success,
            border: `1px solid ${theme.colors.success}`,
          }}
        >
          Registration successful! ❄️ Your registration is pending approval.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Information */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="block mb-2 text-sm font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Full Name *
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
              disabled={isSubmitting || success}
              className="w-full px-4 py-2.5 text-sm transition-all duration-300 focus:outline-none"
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

          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
              disabled={isSubmitting || success}
              className="w-full px-4 py-2.5 text-sm transition-all duration-300 focus:outline-none"
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

          <div>
            <label
              htmlFor="phone"
              className="block mb-2 text-sm font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              disabled={isSubmitting || success}
              className="w-full px-4 py-2.5 text-sm transition-all duration-300 focus:outline-none"
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
        </div>

        {/* Address Information */}
        <div className="space-y-4 pt-2 border-t" style={{ borderColor: 'var(--glass-border)' }}>
          <div>
            <label
              htmlFor="address"
              className="block mb-2 text-sm font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your address"
              disabled={isSubmitting || success}
              className="w-full px-4 py-2.5 text-sm transition-all duration-300 focus:outline-none"
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="city"
                className="block mb-2 text-sm font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City"
                disabled={isSubmitting || success}
                className="w-full px-4 py-2.5 text-sm transition-all duration-300 focus:outline-none"
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

            <div>
              <label
                htmlFor="state"
                className="block mb-2 text-sm font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                State/Province
              </label>
              <input
                id="state"
                name="state"
                type="text"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="State"
                disabled={isSubmitting || success}
                className="w-full px-4 py-2.5 text-sm transition-all duration-300 focus:outline-none"
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
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="zipCode"
                className="block mb-2 text-sm font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                ZIP/Postal Code
              </label>
              <input
                id="zipCode"
                name="zipCode"
                type="text"
                value={formData.zipCode}
                onChange={handleInputChange}
                placeholder="ZIP Code"
                disabled={isSubmitting || success}
                className="w-full px-4 py-2.5 text-sm transition-all duration-300 focus:outline-none"
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

            <div>
              <label
                htmlFor="country"
                className="block mb-2 text-sm font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Country
              </label>
              <input
                id="country"
                name="country"
                type="text"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="Country"
                disabled={isSubmitting || success}
                className="w-full px-4 py-2.5 text-sm transition-all duration-300 focus:outline-none"
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
          </div>
        </div>

        {/* Payment method */}
        <div className="space-y-4 pt-2 border-t" style={{ borderColor: 'var(--glass-border)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Payment method *
          </p>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'slip'}
                onChange={() => setPaymentMethod('slip')}
                disabled={isSubmitting || success}
                className="w-4 h-4"
                style={{ accentColor: theme.colors.glacier500 }}
              />
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Bank transfer / upload payment slip
              </span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'stripe'}
                onChange={() => setPaymentMethod('stripe')}
                disabled={isSubmitting || success}
                className="w-4 h-4"
                style={{ accentColor: theme.colors.glacier500 }}
              />
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Pay with card (Stripe)
              </span>
            </label>
          </div>
        </div>

        {/* Payment slip fields (only when payment method = slip) */}
        {paymentMethod === 'slip' && (
        <>
        <div className="space-y-4 pt-2 border-t" style={{ borderColor: 'var(--glass-border)' }}>
          <div>
            <label
              htmlFor="transactionId"
              className="block mb-2 text-sm font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Transaction ID *
            </label>
            <input
              id="transactionId"
              name="transactionId"
              type="text"
              value={formData.transactionId}
              onChange={handleInputChange}
              placeholder="Enter your payment transaction ID"
              required={paymentMethod === 'slip'}
              disabled={isSubmitting || success}
              className="w-full px-4 py-2.5 text-sm transition-all duration-300 focus:outline-none"
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

          <div>
            <label
              htmlFor="paymentSlip"
              className="block mb-2 text-sm font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Payment Slip *
            </label>
            <div className="space-y-2">
              <label
                htmlFor="paymentSlip"
                className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 hover:border-opacity-70"
                style={{
                  borderColor: 'var(--glass-border)',
                  background: 'var(--input-bg)',
                }}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-2"
                    style={{ color: 'var(--color-text-muted)' }}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p
                    className="mb-2 text-sm"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    JPG, PNG, GIF, WebP or PDF (MAX. 5MB)
                  </p>
                </div>
                <input
                  id="paymentSlip"
                  name="paymentSlip"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  required={paymentMethod === 'slip'}
                  disabled={isSubmitting || success}
                  className="hidden"
                />
              </label>
              {paymentSlipPreview && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--glass-border)' }}>
                  <Image
                    src={paymentSlipPreview}
                    alt="Payment slip preview"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              {paymentSlip && !paymentSlipPreview && (
                <div
                  className="p-3 rounded-lg"
                  style={{
                    background: 'var(--color-frost-100)',
                    border: `1px solid var(--color-frost-300)`,
                  }}
                >
                  <p
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-glacier-500)' }}
                  >
                    📄 {paymentSlip.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        </>
        )}

        {/* Additional Information */}
        <div className="pt-2 border-t" style={{ borderColor: 'var(--glass-border)' }}>
          <label
            htmlFor="additionalInfo"
            className="block mb-2 text-sm font-medium"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Additional Information
          </label>
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleInputChange}
            placeholder="Any additional information you'd like to provide..."
            rows={3}
            disabled={isSubmitting || success}
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

        {paymentMethod === 'slip' ? (
          <button
            type="submit"
            disabled={isSubmitting || success}
            className="w-full px-6 py-3 text-sm font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: isSubmitting || success ? 'var(--glass-bg)' : theme.buttons.primary.background,
              color: theme.buttons.primary.color,
              borderRadius: theme.buttons.primary.radius,
              boxShadow: isSubmitting || success ? 'none' : theme.buttons.primary.shadow,
            }}
          >
            {isSubmitting ? 'Registering...' : success ? 'Registered! ❄️' : 'Submit Registration'}
          </button>
        ) : (
          <button
            type="button"
            disabled={isSubmitting || success || stripeRedirecting}
            onClick={async () => {
              if (!formData.fullName.trim()) { setError('Full name is required'); return }
              if (!formData.email.trim()) { setError('Email is required'); return }
              setError(null)
              setStripeRedirecting(true)
              try {
                sessionStorage.setItem(pendingFormStorageKey(competitionId), JSON.stringify({
                  fullName: formData.fullName,
                  email: formData.email,
                  phone: formData.phone,
                  address: formData.address,
                  city: formData.city,
                  state: formData.state,
                  zipCode: formData.zipCode,
                  country: formData.country,
                  additionalInfo: formData.additionalInfo,
                }))
                const res = await fetch('/api/stripe/create-checkout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    amount: Number(registrationFee) || 0,
                    currency: 'usd',
                    productName: `Registration: ${competitionTitle}`,
                    competitionId,
                  }),
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Could not start checkout')
                if (data.url) window.location.href = data.url
                else setError('No checkout URL received')
              } catch (e: any) {
                setError(e.message || 'Failed to open Stripe checkout')
              } finally {
                setStripeRedirecting(false)
              }
            }}
            className="w-full px-6 py-3 text-sm font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: stripeRedirecting || isSubmitting || success ? 'var(--glass-bg)' : theme.buttons.primary.background,
              color: theme.buttons.primary.color,
              borderRadius: theme.buttons.primary.radius,
              boxShadow: stripeRedirecting || isSubmitting || success ? 'none' : theme.buttons.primary.shadow,
            }}
          >
            {stripeRedirecting ? 'Redirecting to Stripe...' : 'Pay with Stripe'}
          </button>
        )}
      </form>
    </div>
  )
}
