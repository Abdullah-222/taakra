import Link from 'next/link'

export default function StripeCancelPage() {
  return (
    <div className="page-shell min-h-screen py-14">
      <div className="content-wrap max-w-2xl">
        <div className="surface-card p-8 text-center sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
            Payment Cancelled
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">No charge was made</h1>
          <p className="mx-auto mt-3 max-w-[44ch] text-sm text-[color:var(--muted)]">
            Your checkout was cancelled safely. You can restart a payment at any time.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
            <Link href="/#checkout" className="btn-primary px-5 py-2.5 text-sm">
              Try Again
            </Link>
            <Link href="/" className="btn-secondary px-5 py-2.5 text-sm">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
