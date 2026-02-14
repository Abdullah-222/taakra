import Link from 'next/link'

const pillars = [
  {
    title: 'Senior Advisors',
    desc: 'Experienced agents and operators with market-level context across major metros.',
  },
  {
    title: 'Clean Decision Data',
    desc: 'Property details, pricing context, and response history surfaced in one workflow.',
  },
  {
    title: 'Integrated Communication',
    desc: 'Messaging, meeting requests, and approval status remain inside the same platform.',
  },
  {
    title: 'Execution Consistency',
    desc: 'Reliable processes from first touch to closing support long-term trust.',
  },
]

export function WhyChooseUsSection() {
  return (
    <section id="about" className="border-t border-[var(--border)] py-16 sm:py-20">
      <div className="content-wrap">
        <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="surface-card p-6 sm:p-8">
            <h2 className="section-title">Why Teams Choose TAAKRA</h2>
            <p className="section-copy mt-3 text-base">
              Designed for serious property operations, with interfaces that are
              fast to read and easy to act on.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {pillars.map((item) => (
                <article key={item.title} className="surface-muted p-4">
                  <h3 className="text-sm font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
                    {item.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <aside className="surface-card p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              Next Step
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">
              Ready to launch your next property decision?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
              Create an account and start managing listings, requests, and client
              communication from one place.
            </p>

            <div className="mt-6 space-y-2">
              <Link href="/signup" className="btn-primary w-full px-4 py-2.5 text-sm">
                Create account
              </Link>
              <Link href="/competitions" className="btn-secondary w-full px-4 py-2.5 text-sm">
                Explore competitions
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
