'use client'

import Link from 'next/link'
import { useState } from 'react'

const quickFilters = ['City Center', 'Family Homes', 'Investment Ready', 'Move-in Now']

export function HeroSearch() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <section className="border-b border-[var(--border)] py-14 sm:py-20">
      <div className="content-wrap">
        <div className="grid items-start gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-[var(--border)] bg-[color:var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              Premium Property Marketplace
            </p>
            <h1 className="section-title max-w-[15ch]">
              Discover high-quality homes with a cleaner buying journey.
            </h1>
            <p className="section-copy mt-5 text-base sm:text-lg">
              Browse verified listings, request guided video walkthroughs, and
              move from discovery to decision in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/competitions" className="btn-primary px-5 py-3 text-sm">
                Browse Competitions
              </Link>
              <Link href="/meeting" className="btn-secondary px-5 py-3 text-sm">
                Start a Meeting
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:max-w-lg sm:grid-cols-3">
              <StatChip label="Active Listings" value="2.5K" />
              <StatChip label="Avg. Response" value="4m" />
              <StatChip label="Client Rating" value="4.9/5" />
            </div>
          </div>

          <div className="surface-card p-5 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
              Smart Search
            </h2>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Start with a location, neighborhood, or property keyword.
            </p>

            <div className="mt-5 space-y-3">
              <input
                type="text"
                placeholder="Search competitions"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-clean w-full px-4 py-3 text-sm"
              />
              <button type="button" className="btn-primary w-full px-4 py-3 text-sm">
                Search Catalog
              </button>
            </div>

            <div className="divider my-5" />

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                Quick Filters
              </p>
              <div className="flex flex-wrap gap-2">
                {quickFilters.map((filter) => (
                  <span key={filter} className="chip">
                    {filter}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-card px-4 py-3">
      <p className="text-lg font-semibold tracking-tight">{value}</p>
      <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--muted)]">
        {label}
      </p>
    </div>
  )
}
