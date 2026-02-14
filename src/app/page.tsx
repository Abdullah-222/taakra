import { HomeNav } from '@/components/home/HomeNav'
import { HeroSearch } from '@/components/home/HeroSearch'
import { StatsSection } from '@/components/home/StatsSection'
import { FeaturedPropertiesSection } from '@/components/home/FeaturedPropertiesSection'
import { ServicesSection } from '@/components/home/ServicesSection'
import { WhyChooseUsSection } from '@/components/home/WhyChooseUsSection'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { HomeFooter } from '@/components/home/HomeFooter'
import { StripeCheckoutForm } from '@/components/stripe/StripeCheckoutForm'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ stripe?: string; session_id?: string }>
}) {
  const params = await searchParams
  const stripeStatus = params?.stripe
  const sessionId = params?.session_id

  return (
    <div className="page-shell min-h-screen">
      <HomeNav />
      <HeroSearch />
      <StatsSection />
      <FeaturedPropertiesSection />
      <ServicesSection />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <section id="checkout" className="content-wrap py-14">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">
              Payments
            </p>
            <h2 className="text-3xl font-semibold tracking-tight">Start a secure checkout</h2>
            <p className="text-sm text-[color:var(--muted)]">
              Create a one-time Stripe checkout session directly from the home page.
              Perfect for reservation fees, listing upgrades, or premium services.
            </p>
            {stripeStatus === 'success' && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Payment completed successfully.
                {sessionId && (
                  <span className="block text-xs text-emerald-600">
                    Session ID: {sessionId}
                  </span>
                )}
              </div>
            )}
            {stripeStatus === 'cancel' && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Payment cancelled. You can try again anytime.
              </div>
            )}
          </div>
          <StripeCheckoutForm />
        </div>
      </section>
      <HomeFooter />
    </div>
  )
}
