import { Suspense } from 'react'
import { StripeSuccessContent } from '@/components/stripe/StripeSuccessContent'

export default function StripeSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="page-shell min-h-screen py-14">
          <div className="content-wrap max-w-2xl">
            <div className="surface-card p-8 text-center text-sm text-[color:var(--muted)]">
              Loading payment confirmation...
            </div>
          </div>
        </div>
      }
    >
      <StripeSuccessContent />
    </Suspense>
  )
}
