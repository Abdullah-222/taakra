'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useTheme } from 'next-themes'
import { HomeFooter } from '@/components/home/HomeFooter'
import { theme } from '../../../theme'
import { Snowfall } from '@/components/ui/Snowfall'

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

export default function CompetitionsPage() {
  const { theme: currentTheme } = useTheme()
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'deadline' | 'popular'>('newest')

  const categories = [
    'Technology',
    'Design',
    'Business',
    'Arts',
    'Science',
    'Sports',
    'Education',
    'Social Impact',
    'Other',
  ]

  useEffect(() => {
    fetch('/api/competitions')
      .then((res) => res.json())
      .then((data) => {
        setCompetitions(data.competitions || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredAndSortedCompetitions = useMemo(() => {
    let filtered = competitions.filter((competition) => {
      const matchesSearch =
        searchQuery === '' ||
        competition.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        competition.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        competition.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory =
        categoryFilter === '' || competition.category === categoryFilter

      return matchesSearch && matchesCategory
    })

    // Sort competitions
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.deadline).getTime() - new Date(a.deadline).getTime()
      } else if (sortBy === 'deadline') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      } else {
        // popular (by registrations)
        return b._count.registrations - a._count.registrations
      }
    })

    return filtered
  }, [competitions, searchQuery, categoryFilter, sortBy])

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (days < 0) return { text: 'Expired', color: theme.colors.danger }
    if (days === 0) return { text: 'Today', color: theme.colors.warning }
    if (days === 1) return { text: 'Tomorrow', color: theme.colors.warning }
    if (days <= 7) return { text: `${days} days left`, color: theme.colors.warning }
    return { text: date.toLocaleDateString(), color: theme.colors.success }
  }

  const glowEffect = currentTheme === 'dark' ? theme.glow.ice : '0 0 10px rgba(54, 158, 255, 0.15)'

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--background)' }}>
      <Snowfall />
      <main className="py-10 sm:py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-8 sm:mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">❄️</span>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Competition Blizzard
                </p>
                <h1
                  className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Competitions
                </h1>
              </div>
            </div>
            <p
              className="mt-3 max-w-[58ch] text-sm sm:text-base"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Discover unique competition snowflakes. Each one is an opportunity waiting for you. 
              Register, participate, and earn Snow Points!
            </p>
          </header>

          {/* Filters */}
          <section
            className="mb-7 p-5 sm:p-6 rounded-3xl backdrop-blur-xl"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--glass-shadow)',
              borderRadius: theme.radius.xl,
            }}
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Title, description, or tags"
                  className="w-full px-4 py-2.5 text-sm transition-all duration-300 focus:outline-none"
                  style={{
                    background: 'var(--input-bg)',
                    border: 'var(--input-border)',
                    borderRadius: theme.inputs.radius,
                    color: 'var(--input-text)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = glowEffect
                    e.currentTarget.style.border = `1px solid var(--color-glacier-500)`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.border = 'var(--input-border)'
                  }}
                />
              </div>
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm transition-all duration-300 focus:outline-none"
                  style={{
                    background: 'var(--input-bg)',
                    border: 'var(--input-border)',
                    borderRadius: theme.inputs.radius,
                    color: 'var(--input-text)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = glowEffect
                    e.currentTarget.style.border = `1px solid var(--color-glacier-500)`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.border = 'var(--input-border)'
                  }}
                >
                  <option value="">All categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'deadline' | 'popular')}
                  className="w-full px-4 py-2.5 text-sm transition-all duration-300 focus:outline-none"
                  style={{
                    background: 'var(--input-bg)',
                    border: 'var(--input-border)',
                    borderRadius: theme.inputs.radius,
                    color: 'var(--input-text)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = glowEffect
                    e.currentTarget.style.border = `1px solid var(--color-glacier-500)`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.border = 'var(--input-border)'
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="deadline">Deadline Soon</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {(searchQuery || categoryFilter) && (
              <div className="mt-4 flex items-center justify-between gap-3">
                <p
                  className="text-xs"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Showing {filteredAndSortedCompetitions.length} of {competitions.length} competitions
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setCategoryFilter('')
                  }}
                  className="px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--color-text-primary)',
                    borderRadius: theme.radius.md,
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>

          {/* Competitions Grid */}
          {loading ? (
            <div
              className="p-10 text-center text-sm rounded-3xl backdrop-blur-xl"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                color: 'var(--color-text-muted)',
                borderRadius: theme.radius.xl,
              }}
            >
              Loading competitions... ❄️
            </div>
          ) : competitions.length === 0 ? (
            <EmptyState
              title="No competitions available"
              description="Competitions created by admins will appear here once published."
            />
          ) : filteredAndSortedCompetitions.length === 0 ? (
            <EmptyState
              title="No matches for current filters"
              description="Try adjusting your search or category criteria."
            />
          ) : (
            <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredAndSortedCompetitions.map((competition) => {
                const coverImage = competition.images?.[0] ?? null
                const deadlineInfo = formatDeadline(competition.deadline)
                
                return (
                  <Link
                    key={competition.id}
                    href={`/competitions/${competition.id}`}
                    className="rounded-3xl backdrop-blur-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                    style={{
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--glass-border)',
                      boxShadow: 'var(--glass-shadow)',
                      borderRadius: theme.radius.xl,
                    }}
                  >
                    {/* Cover Image */}
                    <div className="relative h-52 w-full overflow-hidden">
                      {coverImage ? (
                        <Image
                          src={coverImage}
                          alt={competition.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          loading="lazy"
                          quality={85}
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{
                            background: 'var(--glass-bg)',
                          }}
                        >
                          <span className="text-6xl opacity-50">❄️</span>
                        </div>
                      )}
                      {/* Deadline Badge */}
                      <div
                        className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm"
                        style={{
                          background: `${deadlineInfo.color}20`,
                          color: deadlineInfo.color,
                          border: `1px solid ${deadlineInfo.color}`,
                        }}
                      >
                        {deadlineInfo.text}
                      </div>
                    </div>

                    <div className="p-5">
                      {/* Category */}
                      <p
                        className="text-xs uppercase tracking-wider mb-2"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {competition.category}
                      </p>

                      {/* Title */}
                      <h2
                        className="line-clamp-2 text-lg font-semibold tracking-tight mb-2"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {competition.title}
                      </h2>

                      {/* Description */}
                      <p
                        className="line-clamp-2 text-sm leading-relaxed mb-3"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {competition.description}
                      </p>

                      {/* Tags */}
                      {competition.tags && competition.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {competition.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs font-medium rounded-full"
                              style={{
                                background: 'var(--color-frost-100)',
                                color: 'var(--color-glacier-500)',
                                border: `1px solid var(--color-frost-300)`,
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                          {competition.tags.length > 3 && (
                            <span
                              className="px-2 py-1 text-xs font-medium"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              +{competition.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Prize and Registrations */}
                      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                        <div>
                          <p
                            className="text-xs uppercase tracking-wider mb-1"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            Prize
                          </p>
                          <p
                            className="text-sm font-semibold"
                            style={{ color: 'var(--color-frost-300)' }}
                          >
                            {competition.prize}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className="text-xs uppercase tracking-wider mb-1"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            Participants
                          </p>
                          <p
                            className="text-sm font-semibold"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {competition._count.registrations} ❄️
                          </p>
                        </div>
                      </div>
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
    <div
      className="p-10 text-center rounded-3xl backdrop-blur-xl"
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
        borderRadius: theme.radius.xl,
      }}
    >
      <div className="text-6xl mb-4">❄️</div>
      <h2
        className="text-lg font-semibold tracking-tight mb-2"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {title}
      </h2>
      <p
        className="text-sm"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {description}
      </p>
    </div>
  )
}

