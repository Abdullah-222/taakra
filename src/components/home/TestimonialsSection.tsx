const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Home Buyer',
    content:
      'The process felt structured from day one. We had clarity on options and closed faster than expected.',
  },
  {
    name: 'Michael Chen',
    role: 'Property Seller',
    content:
      'Positioning and buyer screening were precise. We achieved a stronger final offer with less back-and-forth.',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Investor',
    content:
      'Strong inventory quality and clean communication. It is the first platform I open for acquisition scouting.',
  },
]

export function TestimonialsSection() {
  return (
    <section className="border-t border-[var(--border)] py-16 sm:py-20">
      <div className="content-wrap">
        <div className="mb-10">
          <h2 className="section-title">Client Feedback</h2>
          <p className="section-copy mt-3 text-base">
            Trusted by buyers, sellers, and investors who expect disciplined
            execution.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="surface-card p-6">
              <p className="text-base leading-relaxed text-[color:var(--foreground)]">
                “{item.content}”
              </p>
              <div className="mt-6">
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  {item.role}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
