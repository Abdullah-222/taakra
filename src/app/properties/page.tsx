'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { HomeFooter } from '@/components/home/HomeFooter'

type Property = {
  id: number
  title: string
  description: string
  price: string
  location: string
  images: string[]
  videos: string[]
  createdAt: string
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [priceFilter, setPriceFilter] = useState('')

  useEffect(() => {
    fetch('/api/properties')
      .then((res) => res.json())
      .then((data) => {
        setProperties(data.properties || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesSearch =
        searchQuery === '' ||
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesLocation =
        locationFilter === '' ||
        property.location.toLowerCase().includes(locationFilter.toLowerCase())

      const matchesPrice =
        priceFilter === '' ||
        property.price.toLowerCase().includes(priceFilter.toLowerCase())

      return matchesSearch && matchesLocation && matchesPrice
    })
  }, [properties, searchQuery, locationFilter, priceFilter])

  const uniqueLocations = useMemo(() => {
    const locations = properties.map((p) => p.location)
    return Array.from(new Set(locations)).sort()
  }, [properties])

  return (
    <div className="page-shell min-h-screen">
      <main className="py-10 sm:py-12">
        <div className="content-wrap">
          <header className="mb-8 sm:mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              Property Catalog
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Properties</h1>
            <p className="mt-3 max-w-[58ch] text-sm text-[color:var(--muted)] sm:text-base">
              Explore verified listings and request advisor-guided meetings directly from each property page.
            </p>
          </header>

          <section className="surface-card mb-7 p-5 sm:p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Title, description, or location"
                  className="input-clean w-full px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Location</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="input-clean w-full px-3 py-2.5 text-sm"
                >
                  <option value="">All locations</option>
                  {uniqueLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Price label</label>
                <input
                  type="text"
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  placeholder="Filter by price text"
                  className="input-clean w-full px-3 py-2.5 text-sm"
                />
              </div>
            </div>

            {(searchQuery || locationFilter || priceFilter) && (
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-[color:var(--muted)]">
                  Showing {filteredProperties.length} of {properties.length}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setLocationFilter('')
                    setPriceFilter('')
                  }}
                  className="btn-secondary px-3 py-1.5 text-xs"
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>

          {loading ? (
            <div className="surface-card p-10 text-center text-sm text-[color:var(--muted)]">Loading properties...</div>
          ) : properties.length === 0 ? (
            <EmptyState
              title="No properties available"
              description="Properties created by admins will appear here."
            />
          ) : filteredProperties.length === 0 ? (
            <EmptyState
              title="No matches for current filters"
              description="Try adjusting your search, location, or price criteria."
            />
          ) : (
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProperties.map((property) => {
                const coverImage = property.images[0] ?? null
                return (
                  <Link
                    key={property.id}
                    href={`/competitions/${property.id}`}
                    className="surface-card overflow-hidden transition-transform duration-150 hover:-translate-y-0.5"
                  >
                    <div className="relative h-52 border-b border-[var(--border)] bg-[color:var(--surface-muted)]">
                      {coverImage ? (
                        <Image 
                          src={coverImage} 
                          alt={property.title} 
                          fill 
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          loading="lazy"
                          quality={85}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-[color:var(--muted)]">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h2 className="line-clamp-2 text-lg font-semibold tracking-tight">{property.title}</h2>
                      <p className="mt-1 text-sm text-[color:var(--muted)]">{property.location}</p>
                      <p className="mt-3 text-lg font-semibold text-[color:var(--accent)]">{property.price}</p>
                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[color:var(--muted)]">
                        {property.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </section>
          )}
        </div>
      </main>

      <HomeFooter />
    </div>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="surface-card p-10 text-center">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-[color:var(--muted)]">{description}</p>
    </div>
  )
}
