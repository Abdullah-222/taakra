'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export function StripeCheckoutForm() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [amount, setAmount] = useState('')
  const [productName, setProductName] = useState('')
  const [currency, setCurrency] = useState('usd')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  if (authLoading) {
    return <div className="surface-card p-8 text-sm text-[color:var(--muted)]">Loading...</div>
  }

  if (!user) {
    return <div className="surface-card p-8 text-sm text-[color:var(--muted)]">Redirecting...</div>
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency,
          productName: productName || 'Product',
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Failed to create checkout session')
        setLoading(false)
        return
      }
      if (data.url) window.location.href = data.url
    } catch {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="surface-card p-7 sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
          Payments
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Create Checkout Session</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Generate a secure Stripe checkout session for one-time payment.
        </p>
      </div>

      <form onSubmit={handleCheckout} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/35 dark:text-red-300">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="productName" className="mb-1.5 block text-sm font-medium">
            Product Name
          </label>
          <input
            id="productName"
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="input-clean w-full px-3 py-2.5 text-sm"
            placeholder="Product Name"
          />
        </div>

        <div>
          <label htmlFor="amount" className="mb-1.5 block text-sm font-medium">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="input-clean w-full px-3 py-2.5 text-sm"
            placeholder="0.00"
          />
        </div>

        <div>
          <label htmlFor="currency" className="mb-1.5 block text-sm font-medium">
            Currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="input-clean w-full px-3 py-2.5 text-sm"
          >
            <option value="usd">USD ($)</option>
            <option value="eur">EUR (€)</option>
            <option value="gbp">GBP (£)</option>
            <option value="inr">INR (₹)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full px-4 py-2.5 text-sm disabled:opacity-60"
        >
          {loading ? 'Creating checkout...' : 'Continue to Stripe'}
        </button>
      </form>
    </div>
  )
}
