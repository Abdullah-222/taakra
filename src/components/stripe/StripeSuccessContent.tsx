'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export function StripeSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <div className="page-shell min-h-screen py-14">
      <div className="content-wrap max-w-2xl">
        <div className="surface-card p-8 text-center sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">
            Payment Confirmed
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Transaction successful</h1>
          <p className="mx-auto mt-3 max-w-[44ch] text-sm text-[color:var(--muted)]">
            Your checkout has been completed and no further action is required.
          </p>

          {sessionId && (
            <p className="mx-auto mt-5 max-w-full overflow-x-auto rounded-lg border border-[var(--border)] bg-[color:var(--surface-muted)] px-3 py-2 text-xs text-[color:var(--muted)]">
              Session ID: <span className="font-medium text-[color:var(--foreground)]">{sessionId}</span>
            </p>
          )}

          <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
            <Link href="/" className="btn-primary px-5 py-2.5 text-sm">
              Back to Home
            </Link>
            <Link href="/#checkout" className="btn-secondary px-5 py-2.5 text-sm">
              New Payment
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
