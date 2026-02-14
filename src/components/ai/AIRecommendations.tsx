'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { theme } from '@/lib/theme'
import { useAuth } from '@/hooks/useAuth'

type Competition = {
  id: number
  title: string
  description: string
  category: string
  deadline: string
  prize: string
  images: string[]
  difficulty?: string | null
  _count: {
    registrations: number
  }
}

export function AIRecommendations() {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    fetch('/api/ai/recommendations')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.competitions.length > 0) {
          // Fetch full competition details
          return Promise.all(
            data.competitions.map((id: number) =>
              fetch(`/api/competitions/${id}`)
                .then((r) => r.json())
                .catch(() => null)
            )
          )
        }
        return []
      })
      .then((competitions) => {
        setRecommendations(competitions.filter(Boolean))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user])

  if (!user || loading) {
    return null
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🤖</span>
        <h2
          className="text-xl font-bold"
          style={{ color: theme.colors.textPrimary }}
        >
          Recommended For You ❄️
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((competition) => {
          const coverImage = competition.images?.[0] ?? null
          const deadline = new Date(competition.deadline)
          const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

          return (
            <Link
              key={competition.id}
              href={`/competitions/${competition.id}`}
              className="rounded-2xl backdrop-blur-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
              style={{
                background: theme.glass.background,
                border: theme.glass.border,
                boxShadow: theme.glass.shadow,
                borderRadius: theme.radius.lg,
              }}
            >
              {coverImage && (
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={coverImage}
                    alt={competition.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                    quality={85}
                  />
                  {competition.difficulty && (
                    <div
                      className="absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm"
                      style={{
                        background: `${theme.colors.glacier500}80`,
                        color: theme.colors.textPrimary,
                      }}
                    >
                      {competition.difficulty}
                    </div>
                  )}
                </div>
              )}

              <div className="p-4">
                <p
                  className="text-xs uppercase tracking-wider mb-1"
                  style={{ color: theme.colors.textMuted }}
                >
                  {competition.category}
                </p>
                <h3
                  className="font-semibold line-clamp-2 mb-2"
                  style={{ color: theme.colors.textPrimary }}
                >
                  {competition.title}
                </h3>
                <p
                  className="text-sm line-clamp-2 mb-3"
                  style={{ color: theme.colors.textMuted }}
                >
                  {competition.description}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: theme.colors.textMuted }}>
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                  </span>
                  <span style={{ color: theme.colors.glacier500 }}>
                    {competition._count.registrations} participants
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}


