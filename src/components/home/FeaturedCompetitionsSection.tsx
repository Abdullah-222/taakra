'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { theme } from '../../../theme'

type Competition = {
  id: number
  title: string
  description: string
  category: string
  deadline: string
  prize: string
  tags: string[]
  images: string[]
  status: string
  _count: {
    registrations: number
  }
}

export function FeaturedCompetitionsSection() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/competitions')
      .then((res) => res.json())
      .then((data) => {
        // Get top 6 competitions by registration count (most popular)
        const sorted = (data.competitions || []).sort(
          (a: Competition, b: Competition) => 
            b._count.registrations - a._count.registrations
        )
        setCompetitions(sorted.slice(0, 6))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (days < 0) return { text: 'Expired', color: theme.deadline.urgent }
    if (days === 0) return { text: 'Today', color: theme.deadline.urgent }
    if (days === 1) return { text: 'Tomorrow', color: theme.deadline.soon }
    if (days <= 7) return { text: `${days} days left`, color: theme.deadline.soon }
    return { text: `${days} days left`, color: theme.deadline.safe }
  }

  return (
    <section 
      id="competitions" 
      className="py-16 sm:py-20 relative"
      style={{ background: theme.colors.darkIce }}
    >
      <div className="content-wrap">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: theme.colors.textPrimary }}
            >
              Featured Competitions ❄️
            </h2>
            <p
              className="text-base sm:text-lg max-w-2xl"
              style={{ color: theme.colors.textMuted }}
            >
              A curated selection of trending competitions with high participation and exciting prizes.
              Each one is a unique snowflake waiting for you.
            </p>
          </div>
          <Link
            href="/competitions"
            className="hidden sm:inline-flex px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
            style={{
              background: theme.buttons.primary.background,
              borderRadius: theme.radius.md,
            }}
          >
            See All
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-2xl animate-pulse"
                style={{
                  background: theme.glass.background,
                  border: theme.glass.border,
                }}
              />
            ))}
          </div>
        ) : competitions.length === 0 ? (
          <div
            className="p-12 rounded-2xl text-center"
            style={{
              background: theme.glass.background,
              border: theme.glass.border,
              borderRadius: theme.radius.lg,
            }}
          >
            <p style={{ color: theme.colors.textMuted }}>
              No competitions available at the moment. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {competitions.map((competition) => {
              const deadlineInfo = formatDeadline(competition.deadline)
              return (
                <Link
                  key={competition.id}
                  href={`/competitions/${competition.id}`}
                  className="group"
                >
                  <article
                    className="h-full rounded-2xl overflow-hidden backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                    style={{
                      background: theme.glass.background,
                      border: theme.glass.border,
                      boxShadow: theme.glass.shadow,
                      borderRadius: theme.radius.lg,
                    }}
                  >
                    {/* Image/Header */}
                    <div
                      className="h-40 flex items-end justify-between p-4 relative overflow-hidden"
                      style={{
                        background: competition.images.length > 0
                          ? `url(${competition.images[0]}) center/cover`
                          : `linear-gradient(135deg, ${theme.colors.frost300}, ${theme.colors.glacier500})`,
                      }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                        }}
                      />
                      <span
                        className="relative z-10 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full"
                        style={{
                          background: theme.glass.background,
                          border: theme.glass.border,
                          color: theme.colors.textPrimary,
                        }}
                      >
                        {competition.category}
                      </span>
                      <span
                        className="relative z-10 text-xs font-semibold px-3 py-1 rounded-full"
                        style={{
                          background: deadlineInfo.color,
                          color: '#fff',
                        }}
                      >
                        {deadlineInfo.text}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3
                        className="text-lg font-semibold mb-2 line-clamp-2"
                        style={{ color: theme.colors.textPrimary }}
                      >
                        {competition.title}
                      </h3>
                      <p
                        className="text-sm mb-4 line-clamp-2"
                        style={{ color: theme.colors.textMuted }}
                      >
                        {competition.description}
                      </p>

                      {/* Prize */}
                      <div className="mb-4">
                        <p
                          className="text-xs uppercase tracking-wider mb-1"
                          style={{ color: theme.colors.textMuted }}
                        >
                          Prize
                        </p>
                        <p
                          className="text-base font-semibold"
                          style={{ color: theme.colors.frost300 }}
                        >
                          {competition.prize}
                        </p>
                      </div>

                      {/* Tags & Stats */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1">
                          {competition.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 rounded-full"
                              style={{
                                background: theme.glass.background,
                                border: theme.glass.border,
                                color: theme.colors.textMuted,
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span
                          className="text-xs"
                          style={{ color: theme.colors.textMuted }}
                        >
                          {competition._count.registrations} registrations
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>
        )}

        <div className="mt-6 sm:hidden">
          <Link
            href="/competitions"
            className="block w-full text-center px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300"
            style={{
              background: theme.buttons.primary.background,
              borderRadius: theme.radius.md,
            }}
          >
            See All Competitions
          </Link>
        </div>
      </div>
    </section>
  )
}

