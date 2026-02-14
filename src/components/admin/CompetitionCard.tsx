'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { theme } from '../../../theme'
import { toast } from '@/components/ui/ToasterProvider'

type Competition = {
  id: number
  title: string
  description: string
  category: string
  deadline: Date
  prize: string
  tags: string[]
  images: string[]
  status: string
  _count: {
    registrations: number
  }
}

type CompetitionCardProps = {
  competition: Competition
}

function getStatusColor(status: string) {
  switch (status) {
    case 'published':
      return theme.colors.success
    case 'draft':
      return theme.colors.warning
    case 'closed':
      return theme.colors.textMuted
    default:
      return theme.colors.textMuted
  }
}

function formatDeadline(deadline: Date) {
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

export function CompetitionCard({
  competition,
}: CompetitionCardProps) {
  const router = useRouter()
  const { theme: currentTheme } = useTheme()
  const [isDeleting, setIsDeleting] = useState(false)
  const glowEffect = currentTheme === 'dark' ? theme.glow.strong : '0 0 20px rgba(54, 158, 255, 0.2)'

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${competition.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      setIsDeleting(true)
      const res = await fetch(`/api/admin/competitions/${competition.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const message = data?.error ?? 'Failed to delete competition'
        throw new Error(message)
      }

      toast.success('Competition deleted successfully ❄️')
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Failed to delete competition')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      className="p-6 rounded-3xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
        borderRadius: theme.radius.xl,
      }}
    >
      {/* Cover Image */}
      <div className="relative h-48 w-full mb-4 rounded-xl overflow-hidden">
        {competition.images && competition.images.length > 0 ? (
          <Image
            src={competition.images[0]}
            alt={competition.title}
            fill
            className="object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <span className="text-6xl opacity-50">❄️</span>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3
            className="text-lg font-semibold mb-1 line-clamp-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {competition.title}
          </h3>
          <p
            className="text-xs uppercase tracking-wider"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {competition.category}
          </p>
        </div>
        <span
          className="text-2xl"
          style={{
            filter: `drop-shadow(${theme.glow.ice})`,
          }}
        >
          ❄
        </span>
      </div>

      {/* Description */}
      <p
        className="text-sm mb-4 line-clamp-3"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {competition.description}
      </p>

      {/* Tags */}
      {competition.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
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

      {/* Stats */}
      <div className="flex items-center justify-between mb-4 pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
        <div>
          <p
            className="text-xs uppercase tracking-wider mb-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Registrations
          </p>
          <p
            className="text-lg font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {competition._count.registrations}
          </p>
        </div>
        <div className="text-right">
          <p
            className="text-xs uppercase tracking-wider mb-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Deadline
          </p>
          <p
            className="text-sm font-semibold"
            style={{
              color: formatDeadline(competition.deadline).color,
            }}
          >
            {formatDeadline(competition.deadline).text}
          </p>
        </div>
      </div>

      {/* Prize */}
      <div className="mb-4">
        <p
          className="text-xs uppercase tracking-wider mb-1"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Prize
        </p>
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--color-frost-300)' }}
        >
          {competition.prize}
        </p>
      </div>

      {/* Status Badge and Actions */}
      <div className="flex items-center justify-between">
        <span
          className="px-3 py-1 text-xs font-semibold rounded-full"
          style={{
            background: `${getStatusColor(competition.status)}20`,
            color: getStatusColor(competition.status),
            border: `1px solid ${getStatusColor(competition.status)}`,
          }}
        >
          {competition.status}
        </span>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/competitions/${competition.id}/edit`}
            className="text-xs font-medium transition-colors hover:underline px-2 py-1 rounded"
            style={{ 
              color: 'var(--color-glacier-500)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-frost-100)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs font-medium transition-colors hover:underline px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              color: theme.colors.danger,
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.background = `${theme.colors.danger}20`
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

