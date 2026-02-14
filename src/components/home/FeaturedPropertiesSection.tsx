import Link from 'next/link'

const FEATURED_PROPERTIES = [
  {
    id: 1,
    title: 'Modern Luxury Villa',
    location: 'Beverly Hills, CA',
    price: '$2,450,000',
    bedrooms: 4,
    bathrooms: 3,
    sqft: '3,200',
    status: 'Featured',
  },
  {
    id: 2,
    title: 'Downtown Penthouse',
    location: 'Manhattan, NY',
    price: '$3,850,000',
    bedrooms: 3,
    bathrooms: 2,
    sqft: '2,800',
    status: 'Featured',
  },
  {
    id: 3,
    title: 'Coastal Family Home',
    location: 'Malibu, CA',
    price: '$1,950,000',
    bedrooms: 5,
    bathrooms: 4,
    sqft: '4,100',
    status: 'New',
  },
  {
    id: 4,
    title: 'Urban Loft',
    location: 'Brooklyn, NY',
    price: '$1,250,000',
    bedrooms: 2,
    bathrooms: 2,
    sqft: '1,800',
    status: 'New',
  },
  {
    id: 5,
    title: 'Mountain Retreat',
    location: 'Aspen, CO',
    price: '$2,750,000',
    bedrooms: 6,
    bathrooms: 5,
    sqft: '5,200',
    status: 'Featured',
  },
  {
    id: 6,
    title: 'Suburban Estate',
    location: 'Westchester, NY',
    price: '$1,650,000',
    bedrooms: 4,
    bathrooms: 3,
    sqft: '3,500',
    status: 'New',
  },
]

export function FeaturedPropertiesSection() {
  return (
    <section id="properties" className="py-16 sm:py-20">
      <div className="content-wrap">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="section-title">Featured Properties</h2>
            <p className="section-copy mt-3 text-base">
              A curated set of listings with strong location value and high
              buyer interest.
            </p>
          </div>
          <Link href="/competitions" className="btn-secondary hidden px-4 py-2 text-sm sm:inline-flex">
            See all competitions
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {FEATURED_PROPERTIES.map((property) => (
            <article key={property.id} className="surface-card overflow-hidden">
              <div className="flex h-40 items-end justify-between border-b border-[var(--border)] bg-[color:var(--surface-muted)] p-4">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  {property.location}
                </span>
                <span className="chip">{property.status}</span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold tracking-tight">{property.title}</h3>
                <p className="mt-2 text-xl font-semibold tracking-tight text-[color:var(--accent)]">
                  {property.price}
                </p>
                <p className="mt-4 text-sm text-[color:var(--muted)]">
                  {property.bedrooms} beds · {property.bathrooms} baths · {property.sqft} sqft
                </p>
                <button type="button" className="btn-secondary mt-5 w-full px-4 py-2.5 text-sm">
                  View Property
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link href="/competitions" className="btn-secondary w-full px-4 py-2.5 text-sm">
            See all competitions
          </Link>
        </div>
      </div>
    </section>
  )
}
