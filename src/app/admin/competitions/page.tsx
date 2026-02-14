import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { theme } from '@/lib/theme'
import { CreateCompetitionButton } from '@/components/admin/CreateCompetitionButton'
import { CompetitionCard } from '@/components/admin/CompetitionCard'

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
  { value: 'closed', label: 'Closed' },
] as const

type PageProps = {
  searchParams: Promise<{ tab?: string }>
}

export default async function AdminCompetitionsPage({ searchParams }: PageProps) {
  const { tab } = await searchParams
  const activeTab = (tab && TABS.some((t) => t.value === tab)) ? tab : 'all'

  const statusFilter =
    activeTab === 'all'
      ? undefined
      : activeTab === 'draft'
        ? 'draft'
        : activeTab === 'published'
          ? 'published'
          : 'closed'

  const competitions = await prisma.competition.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          registrations: true,
        },
      },
    },
  })

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">❄️</span>
              <h1
                className="text-3xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Competitions
              </h1>
            </div>
            <p
              className="text-base"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Manage all competition snowflakes in the blizzard
            </p>
          </div>
          <CreateCompetitionButton href="/admin/competitions/new">
            <span className="inline-flex items-center gap-2">
              <span>+</span>
              <span>Create Competition</span>
            </span>
          </CreateCompetitionButton>
        </div>

        {/* Tabs: All | Published | Drafts | Closed */}
        <nav
          className="flex flex-wrap gap-1 mb-6 p-1 rounded-2xl"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
          }}
          aria-label="Competition status tabs"
        >
          {TABS.map((t) => {
            const isActive = activeTab === t.value
            return (
              <Link
                key={t.value}
                href={t.value === 'all' ? '/admin/competitions' : `/admin/competitions?tab=${t.value}`}
                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: isActive ? 'var(--color-glacier-500)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--color-text-secondary)',
                }}
              >
                {t.label}
              </Link>
            )
          })}
        </nav>

        {/* Competitions List */}
        {competitions.length === 0 ? (
          <div
            className="p-12 text-center rounded-3xl backdrop-blur-xl"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--glass-shadow)',
              borderRadius: theme.radius.xl,
            }}
          >
            <div className="text-6xl mb-4">❄️</div>
            <h3
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {activeTab === 'all' && 'No competitions yet'}
              {activeTab === 'published' && 'No published competitions'}
              {activeTab === 'draft' && 'No drafts'}
              {activeTab === 'closed' && 'No closed competitions'}
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {activeTab === 'draft' || activeTab === 'all'
                ? 'Create your first competition snowflake to get started'
                : `No competitions in this category. Switch to another tab or create a new one.`}
            </p>
            {(activeTab === 'all' || activeTab === 'draft') && (
              <CreateCompetitionButton href="/admin/competitions/new" className="inline-block">
                Create Competition ❄️
              </CreateCompetitionButton>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {competitions.map((competition) => (
              <CompetitionCard
                key={competition.id}
                competition={competition}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

