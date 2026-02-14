const SERVICES = [
  {
    title: 'Acquisition Advisory',
    description:
      'Guided buying strategy with shortlists based on budget, lifestyle, and long-term value.',
  },
  {
    title: 'Seller Representation',
    description:
      'Pricing, media positioning, and offer management designed to protect margin.',
  },
  {
    title: 'Rental Placement',
    description:
      'Tenant-ready listings and screening support for efficient rental turnover.',
  },
  {
    title: 'Portfolio Valuation',
    description:
      'Data-backed valuation snapshots for owners, investors, and institutional teams.',
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="border-t border-[var(--border)] py-16 sm:py-20">
      <div className="content-wrap">
        <div className="mb-10">
          <h2 className="section-title">Professional Services</h2>
          <p className="section-copy mt-3 text-base">
            Structured services built for buyers, sellers, and operators who
            need predictable execution.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {SERVICES.map((service, index) => (
            <article key={service.title} className="surface-card p-5">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 text-base font-semibold tracking-tight">{service.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
