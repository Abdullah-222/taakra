import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { AIInsights } from '@/components/admin/AIInsights'
import { theme } from '@/lib/theme'

export default async function AdminDashboardPage() {
  const [totalProperties, recentProperties, recentActivities] =
    await Promise.all([
      prisma.property.count(),
      prisma.property.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          location: true,
          price: true,
          createdAt: true,
        },
      }),
      prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),
    ])

  function getActivityIcon(action: string) {
    const icons: Record<string, string> = {
      property_created: '🏠',
      property_viewed: '👁️',
      property_updated: '✏️',
      property_deleted: '🗑️',
      user_registered: '👤',
      user_logged_in: '🔐',
      user_logged_out: '🚪',
      admin_login: '👑',
      system_event: '⚙️',
    }
    return icons[action] || '📋'
  }

  function formatActivityAction(action: string) {
    return action
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  function formatTimeAgo(date: Date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  return (
    <div className="p-8" style={{ background: 'var(--background)' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 
            className="text-2xl font-bold mb-1"
            style={{ color: theme.colors.textPrimary }}
          >
            Dashboard
          </h1>
          <p style={{ color: theme.colors.textMuted }}>
            Recent activity and quick overview.
          </p>
        </div>
        <Link
          href="/admin/analytics"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all duration-300 hover:scale-105"
          style={{
            background: theme.buttons.primary.background,
            color: theme.buttons.primary.color,
            borderRadius: theme.radius.md,
          }}
        >
          <span>📈</span>
          <span>View Analytics</span>
        </Link>
      </div>

      {/* AI Insights */}
      <div className="mb-6">
        <AIInsights />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div 
          className="rounded-xl p-6 glass-animated transition-all duration-300 hover:scale-[1.01]"
          style={{
            background: theme.glass.background,
            border: theme.glass.border,
            boxShadow: theme.glass.shadow,
            backdropFilter: theme.glass.blur,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 
              className="text-lg font-semibold"
              style={{ color: theme.colors.textPrimary }}
            >
              Recent Activity
            </h2>
            <Link
              href="/admin/analytics"
              className="text-xs hover:underline transition-all duration-200"
              style={{ color: theme.colors.success }}
            >
              View all
            </Link>
          </div>
          {recentActivities.length === 0 ? (
            <p 
              className="text-sm"
              style={{ color: theme.colors.textMuted }}
            >
              No recent activity
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity) => {
                const metadata = activity.metadata
                  ? JSON.parse(activity.metadata)
                  : {}
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg transition-all duration-200 hover:scale-[1.01]"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: theme.glass.border,
                    }}
                  >
                    <div className="text-xl">{getActivityIcon(activity.action)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p 
                          className="text-sm font-medium"
                          style={{ color: theme.colors.textPrimary }}
                        >
                          {formatActivityAction(activity.action)}
                        </p>
                        <span 
                          className="text-xs"
                          style={{ color: theme.colors.textMuted }}
                        >
                          {formatTimeAgo(activity.createdAt)}
                        </span>
                      </div>
                      {activity.user && (
                        <p 
                          className="text-xs"
                          style={{ color: theme.colors.textSecondary }}
                        >
                          by {activity.user.email}
                        </p>
                      )}
                      {metadata.title && (
                        <p 
                          className="text-xs mt-1"
                          style={{ color: theme.colors.textMuted }}
                        >
                          {metadata.title}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div 
          className="rounded-xl p-6 glass-animated transition-all duration-300 hover:scale-[1.01]"
          style={{
            background: theme.glass.background,
            border: theme.glass.border,
            boxShadow: theme.glass.shadow,
            backdropFilter: theme.glass.blur,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 
              className="text-lg font-semibold"
              style={{ color: theme.colors.textPrimary }}
            >
              Recent Properties
            </h2>
            <Link
              href="/admin/competitions"
              className="text-xs hover:underline transition-all duration-200"
              style={{ color: theme.colors.success }}
            >
              View all ({totalProperties})
            </Link>
          </div>
          {recentProperties.length === 0 ? (
            <p 
              className="text-sm"
              style={{ color: theme.colors.textMuted }}
            >
              No properties yet
            </p>
          ) : (
            <div className="space-y-3">
              {recentProperties.map((property) => (
                <Link
                  key={property.id}
                  href={`/competitions/${property.id}`}
                  className="flex items-start gap-3 p-3 rounded-lg transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: theme.glass.border,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                  }}
                >
                  <div className="text-xl">🏠</div>
                  <div className="flex-1 min-w-0">
                    <p 
                      className="text-sm font-medium mb-1"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {property.title}
                    </p>
                    <p 
                      className="text-xs"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      📍 {property.location} • {property.price}
                    </p>
                    <p 
                      className="text-xs mt-1"
                      style={{ color: theme.colors.textMuted }}
                    >
                      {formatDate(property.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div 
        className="mt-6 rounded-xl p-6 glass-animated transition-all duration-300"
        style={{
          background: theme.glass.background,
          border: theme.glass.border,
          boxShadow: theme.glass.shadow,
          backdropFilter: theme.glass.blur,
        }}
      >
        <h2 
          className="text-lg font-semibold mb-4"
          style={{ color: theme.colors.textPrimary }}
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href="/admin/competitions/new"
            className="flex flex-col items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: `1px solid ${theme.colors.success}40`,
              color: theme.colors.success,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'
            }}
          >
            <span className="text-2xl">➕</span>
            <span className="text-xs font-medium text-center">New Competition</span>
          </Link>
          <Link
            href="/admin/competitions"
            className="flex flex-col items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: theme.glass.border,
              color: theme.colors.textSecondary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
            }}
          >
            <span className="text-2xl">❄️</span>
            <span className="text-xs font-medium text-center">Competitions</span>
          </Link>
          <Link
            href="/admin/users"
            className="flex flex-col items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: theme.glass.border,
              color: theme.colors.textSecondary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
            }}
          >
            <span className="text-2xl">👥</span>
            <span className="text-xs font-medium text-center">Users</span>
          </Link>
          <Link
            href="/admin/analytics"
            className="flex flex-col items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: theme.glass.border,
              color: theme.colors.textSecondary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
            }}
          >
            <span className="text-2xl">📈</span>
            <span className="text-xs font-medium text-center">Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
