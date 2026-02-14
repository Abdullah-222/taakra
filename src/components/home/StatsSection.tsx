const metrics = [
  { value: '2,500+', label: 'Properties Sold' },
  { value: '15+', label: 'Years in Market' },
  { value: '98%', label: 'Client Satisfaction' },
  { value: '$2.5B', label: 'Transaction Volume' },
]

export function StatsSection() {
  return (
    <section className="border-b border-[var(--border)] py-12">
      <div className="content-wrap">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <article key={metric.label} className="surface-card p-5">
              <p className="text-3xl font-semibold tracking-tight">{metric.value}</p>
              <p className="mt-1 text-sm text-[color:var(--muted)]">{metric.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
