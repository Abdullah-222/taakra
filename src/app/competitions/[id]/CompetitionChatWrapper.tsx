'use client'

import dynamic from 'next/dynamic'

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

type Props = {
  competitionId: number
  competitionTitle: string
  currentUser: { id: number; email: string; name: string | null } | null
}

export function CompetitionChatWrapper(props: Props) {
  return <CompetitionChat {...props} />
}

