import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import dynamic from 'next/dynamic'
import { HomeFooter } from '@/components/home/HomeFooter'
import { logActivity } from '@/lib/activity'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { theme } from '@/lib/theme'
import { Snowfall } from '@/components/ui/Snowfall'
import { CompetitionRegistrationForm } from './CompetitionRegistrationForm'
import { RuleSimplifier } from '@/components/ai/RuleSimplifier'
import { PrepGuide } from '@/components/ai/PrepGuide'

// Lazy load CompetitionChat - it's heavy with socket.io
const CompetitionChat = dynamic(
  () => import('./CompetitionChat').then((mod) => ({ default: mod.CompetitionChat })),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
        Loading chat...
      </div>
    ),
  }
)

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function CompetitionDetailPage({ params }: PageProps) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (Number.isNaN(id)) {
    notFound()
  }

  const competition = await prisma.competition.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
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

  if (!competition) {
    notFound()
  }

  const currentUser = await getCurrentUser()
  
  // Check if user is already registered
  let userRegistration = null
  if (currentUser) {
    userRegistration = await prisma.competitionRegistration.findUnique({
      where: {
        competitionId_userId: {
          competitionId: id,
          userId: currentUser.id,
        },
      },
    })
  }

  await logActivity({
    action: 'competition_viewed',
    entityType: 'competition',
    entityId: competition.id,
    userId: currentUser?.id,
    metadata: { title: competition.title },
  })

  const deadline = new Date(competition.deadline)
  const isExpired = deadline < new Date()
  const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--background)' }}>
      <Snowfall />
      <main className="py-10 sm:py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/competitions"
            className="inline-flex items-center gap-2 mb-6 text-sm transition-all duration-300 hover:scale-105"
            style={{ color: 'var(--color-text-muted)' }}
          >
            ← Back to competitions
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            {/* Main Content */}
            <div className="space-y-6">
              {/* Cover Image */}
              {competition.images && competition.images.length > 0 && (
                <div
                  className="relative h-96 w-full overflow-hidden rounded-3xl"
                  style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: theme.radius.xl,
                  }}
                >
                  <Image
                    src={competition.images[0]}
                    alt={competition.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 75vw"
                    priority
                    quality={90}
                  />
                </div>
              )}

              {/* Competition Details */}
              <div
                className="p-6 sm:p-8 rounded-3xl backdrop-blur-xl"
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  boxShadow: 'var(--glass-shadow)',
                  borderRadius: theme.radius.xl,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p
                      className="text-xs uppercase tracking-wider mb-2"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {competition.category}
                      {competition.subcategory && ` • ${competition.subcategory}`}
                    </p>
                    <h1
                      className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {competition.title}
                    </h1>
                  </div>
                  <div
                    className="px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-sm"
                    style={{
                      background: isExpired
                        ? `${theme.colors.danger}20`
                        : daysLeft <= 7
                        ? `${theme.colors.warning}20`
                        : `${theme.colors.success}20`,
                      color: isExpired
                        ? theme.colors.danger
                        : daysLeft <= 7
                        ? theme.colors.warning
                        : theme.colors.success,
                      border: `1px solid ${
                        isExpired
                          ? theme.colors.danger
                          : daysLeft <= 7
                          ? theme.colors.warning
                          : theme.colors.success
                      }`,
                    }}
                  >
                    {isExpired
                      ? 'Expired'
                      : daysLeft === 0
                      ? 'Today'
                      : daysLeft === 1
                      ? 'Tomorrow'
                      : `${daysLeft} days left`}
                  </div>
                </div>

                <p
                  className="text-base leading-relaxed mb-6"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {competition.description}
                </p>

                {/* Rules of competition */}
                {competition.rules && competition.rules.trim() && (
                  <div className="mb-6 pt-6 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                    <RuleSimplifier rules={competition.rules} competitionTitle={competition.title} />
                  </div>
                )}

                {/* AI Preparation Guide */}
                <div className="mb-6 pt-6 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                  <PrepGuide
                    title={competition.title}
                    description={competition.description}
                    category={competition.category}
                    rules={competition.rules}
                  />
                </div>

                {/* Tags */}
                {competition.tags && competition.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {competition.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 text-xs font-medium rounded-full"
                        style={{
                          background: 'var(--color-frost-100)',
                          color: 'var(--color-glacier-500)',
                          border: `1px solid var(--color-frost-300)`,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Prize and Participants */}
                <div className="grid gap-4 sm:grid-cols-2 pt-6 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                  <div>
                    <p
                      className="text-xs uppercase tracking-wider mb-2"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Prize
                    </p>
                    <p
                      className="text-lg font-semibold"
                      style={{ color: 'var(--color-frost-300)' }}
                    >
                      {competition.prize}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs uppercase tracking-wider mb-2"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Participants
                    </p>
                    <p
                      className="text-lg font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {competition._count.registrations} ❄️
                    </p>
                  </div>
                </div>

                {/* Deadline */}
                <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                  <p
                    className="text-xs uppercase tracking-wider mb-2"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Deadline
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {deadline.toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* Videos */}
                {competition.videos && competition.videos.length > 0 && (
                  <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                    <p
                      className="text-xs uppercase tracking-wider mb-4"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Videos
                    </p>
                    <div className="space-y-4">
                      {competition.videos.map((videoUrl, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-video overflow-hidden rounded-xl"
                          style={{
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                          }}
                        >
                          <video src={videoUrl} controls className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Registration Form + Live Chat */}
            <aside className="space-y-6">
              <CompetitionRegistrationForm
                competitionId={competition.id}
                competitionTitle={competition.title}
                deadline={competition.deadline}
                isExpired={isExpired}
                userRegistration={userRegistration}
                currentUser={currentUser}
                registrationFee={Number(process.env.NEXT_PUBLIC_STRIPE_REGISTRATION_FEE) || 0}
              />
              <CompetitionChat
                competitionId={competition.id}
                competitionTitle={competition.title}
                currentUser={currentUser ? { id: currentUser.id, email: currentUser.email, name: currentUser.name } : null}
              />
            </aside>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  )
}

