import { prisma } from '@/lib/prisma'
import { theme } from '../../../../theme'
import { CreateCompetitionButton } from '@/components/admin/CreateCompetitionButton'
import { CompetitionCard } from '@/components/admin/CompetitionCard'

export default async function AdminCompetitionsPage() {
  const competitions = await prisma.competition.findMany({
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
              No competitions yet
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Create your first competition snowflake to get started
            </p>
            <CreateCompetitionButton href="/admin/competitions/new" className="inline-block">
              Create Competition ❄️
            </CreateCompetitionButton>
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

