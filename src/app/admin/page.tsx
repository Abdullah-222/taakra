import { prisma } from '@/lib/prisma'
import Link from 'next/link'

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
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white mb-1">
            Dashboard
          </h1>
          <p className="text-stone-600 dark:text-gray-400">
            Recent activity and quick overview.
          </p>
        </div>
        <Link
          href="/admin/analytics"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold shadow-sm transition-colors"
        >
          <span>📈</span>
          <span>View Analytics</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-white">
              Recent Activity
            </h2>
            <Link
              href="/admin/analytics"
              className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              View all
            </Link>
          </div>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-stone-500 dark:text-gray-400">
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
                    className="flex items-start gap-3 p-3 rounded-lg bg-stone-50 dark:bg-gray-900/50 border border-stone-200 dark:border-gray-700"
                  >
                    <div className="text-xl">{getActivityIcon(activity.action)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-stone-900 dark:text-white">
                          {formatActivityAction(activity.action)}
                        </p>
                        <span className="text-xs text-stone-500 dark:text-gray-400">
                          {formatTimeAgo(activity.createdAt)}
                        </span>
                      </div>
                      {activity.user && (
                        <p className="text-xs text-stone-600 dark:text-gray-400">
                          by {activity.user.email}
                        </p>
                      )}
                      {metadata.title && (
                        <p className="text-xs text-stone-500 dark:text-gray-500 mt-1">
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

        <div className="bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-white">
              Recent Properties
            </h2>
            <Link
              href="/admin/competitions"
              className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              View all ({totalProperties})
            </Link>
          </div>
          {recentProperties.length === 0 ? (
            <p className="text-sm text-stone-500 dark:text-gray-400">
              No properties yet
            </p>
          ) : (
            <div className="space-y-3">
              {recentProperties.map((property) => (
                <Link
                  key={property.id}
                  href={`/competitions/${property.id}`}
                  className="flex items-start gap-3 p-3 rounded-lg bg-stone-50 dark:bg-gray-900/50 border border-stone-200 dark:border-gray-700 hover:bg-stone-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="text-xl">🏠</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 dark:text-white mb-1">
                      {property.title}
                    </p>
                    <p className="text-xs text-stone-600 dark:text-gray-400">
                      📍 {property.location} • {property.price}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-gray-500 mt-1">
                      {formatDate(property.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href="/admin/competitions/new"
            className="flex flex-col items-center gap-2 px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
          >
            <span className="text-2xl">➕</span>
            <span className="text-xs font-medium text-center">New Competition</span>
          </Link>
          <Link
            href="/admin/competitions"
            className="flex flex-col items-center gap-2 px-4 py-3 rounded-lg bg-stone-50 dark:bg-gray-900/50 text-stone-700 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="text-2xl">❄️</span>
            <span className="text-xs font-medium text-center">Competitions</span>
          </Link>
          <Link
            href="/admin/users"
            className="flex flex-col items-center gap-2 px-4 py-3 rounded-lg bg-stone-50 dark:bg-gray-900/50 text-stone-700 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="text-2xl">👥</span>
            <span className="text-xs font-medium text-center">Users</span>
          </Link>
          <Link
            href="/admin/analytics"
            className="flex flex-col items-center gap-2 px-4 py-3 rounded-lg bg-stone-50 dark:bg-gray-900/50 text-stone-700 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="text-2xl">📈</span>
            <span className="text-xs font-medium text-center">Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
