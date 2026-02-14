import { StripeCheckoutForm } from '@/components/stripe/StripeCheckoutForm'

export default function StripePage() {
  return (
    <div className="page-shell min-h-screen py-12">
      <div className="content-wrap max-w-3xl">
        <StripeCheckoutForm />
      </div>
    </div>
  )
}
