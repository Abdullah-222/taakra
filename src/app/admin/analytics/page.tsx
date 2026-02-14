'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { theme } from '@/lib/theme'

type AnalyticsData = {
  totalUsers: number
  activeUsers: number
  totalProperties: number
  propertiesLast30Days: number
  usersLast30Days: number
  activities: Array<{
    id: number
    action: string
    entityType: string | null
    entityId: number | null
    userId: number | null
    metadata: string | null
    createdAt: string
    user: {
      id: number
      email: string
      name: string | null
    } | null
  }>
  dailyStats?: Array<{
    date: string
    properties: number
    users: number
    activities: number
  }>
}

// Theme-aligned chart palette (hex for Recharts): glacier, success, violet, warning, danger
const CHART_COLORS = ['#007aff', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444']

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => res.json())
      .then((result) => {
        setData(result.analytics)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  if (loading || !data) {
    return (
      <div className="p-8 min-h-screen" style={{ background: 'var(--background)' }}>
        <div className="flex items-center justify-center h-64">
          <div
            className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl"
            style={{
              background: theme.glass.background,
              border: theme.glass.border,
              color: theme.colors.textMuted,
            }}
          >
            <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Loading analytics...
          </div>
        </div>
      </div>
    )
  }

  // Activity stats
  const activityStats = data.activities.reduce(
    (acc, activity) => {
      acc[activity.action] = (acc[activity.action] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Prepare pie chart data
  const pieData = Object.entries(activityStats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  // Prepare daily stats for line chart
  const chartDailyStats =
    data.dailyStats?.map((stat) => ({
      date: new Date(stat.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      activities: stat.activities,
      properties: stat.properties,
      users: stat.users,
    })) || []

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

  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString)
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📊</span>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: theme.colors.textPrimary }}
          >
            Analytics Dashboard
          </h1>
        </div>
        <p
          className="text-base"
          style={{ color: theme.colors.textMuted }}
        >
          Comprehensive insights into your platform&apos;s performance and user activity.
        </p>
      </div>

      {/* Key Metrics KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] glass-animated"
          style={{
            background: theme.glass.background,
            border: theme.glass.border,
            boxShadow: theme.glass.shadow,
            backdropFilter: theme.glass.blur,
          }}
        >
          <div className="text-3xl mb-2">🏠</div>
          <div className="text-3xl font-bold mb-1" style={{ color: theme.colors.textPrimary }}>
            {data.totalProperties}
          </div>
          <div className="text-sm" style={{ color: theme.colors.textSecondary }}>Total Properties</div>
          <div className="text-xs mt-2" style={{ color: theme.colors.textMuted }}>
            +{data.propertiesLast30Days} this month
          </div>
        </div>

        <div
          className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] glass-animated"
          style={{
            background: theme.glass.background,
            border: theme.glass.border,
            boxShadow: theme.glass.shadow,
            backdropFilter: theme.glass.blur,
          }}
        >
          <div className="text-3xl mb-2">👥</div>
          <div className="text-3xl font-bold mb-1" style={{ color: theme.colors.textPrimary }}>
            {data.totalUsers}
          </div>
          <div className="text-sm" style={{ color: theme.colors.textSecondary }}>Total Users</div>
          <div className="text-xs mt-2" style={{ color: theme.colors.textMuted }}>
            +{data.usersLast30Days} this month
          </div>
        </div>

        <div
          className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] glass-animated"
          style={{
            background: theme.glass.background,
            border: theme.glass.border,
            boxShadow: theme.glass.shadow,
            backdropFilter: theme.glass.blur,
          }}
        >
          <div className="text-3xl mb-2">✨</div>
          <div className="text-3xl font-bold mb-1" style={{ color: theme.colors.textPrimary }}>
            {data.activeUsers}
          </div>
          <div className="text-sm" style={{ color: theme.colors.textSecondary }}>Active Users</div>
          <div className="text-xs mt-2" style={{ color: theme.colors.textMuted }}>Last 30 days</div>
        </div>

        <div
          className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] glass-animated"
          style={{
            background: theme.glass.background,
            border: theme.glass.border,
            boxShadow: theme.glass.shadow,
            backdropFilter: theme.glass.blur,
          }}
        >
          <div className="text-3xl mb-2">📈</div>
          <div className="text-3xl font-bold mb-1" style={{ color: theme.colors.textPrimary }}>
            {data.activities.length}
          </div>
          <div className="text-sm" style={{ color: theme.colors.textSecondary }}>Total Activities</div>
          <div className="text-xs mt-2" style={{ color: theme.colors.textMuted }}>Tracked events</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Activity Trend Line Chart */}
        <div
          className="rounded-2xl p-6 glass-animated transition-all duration-300 hover:scale-[1.01]"
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
            Activity Trend (Last 7 Days)
          </h2>
          {chartDailyStats.length === 0 ? (
            <p className="text-sm" style={{ color: theme.colors.textMuted }}>
              No activity data available
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartDailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" opacity={0.8} />
                <XAxis
                  dataKey="date"
                  stroke="var(--color-text-muted)"
                  style={{ fontSize: '12px' }}
                  tick={{ fill: 'var(--color-text-muted)' }}
                />
                <YAxis
                  stroke="var(--color-text-muted)"
                  style={{ fontSize: '12px' }}
                  tick={{ fill: 'var(--color-text-muted)' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--glass-bg)',
                    border: theme.glass.border,
                    borderRadius: theme.radius.sm,
                    color: 'var(--color-text-primary)',
                  }}
                  labelStyle={{ color: 'var(--color-text-primary)' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="activities"
                  stroke={CHART_COLORS[1]}
                  strokeWidth={2}
                  name="Activities"
                  dot={{ fill: CHART_COLORS[1], r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="properties"
                  stroke={CHART_COLORS[0]}
                  strokeWidth={2}
                  name="Properties"
                  dot={{ fill: CHART_COLORS[0], r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke={CHART_COLORS[2]}
                  strokeWidth={2}
                  name="Users"
                  dot={{ fill: CHART_COLORS[2], r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Activity Breakdown Pie Chart */}
        <div
          className="rounded-2xl p-6 glass-animated transition-all duration-300 hover:scale-[1.01]"
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
            Activity Breakdown
          </h2>
          {pieData.length === 0 ? (
            <p className="text-sm" style={{ color: theme.colors.textMuted }}>
              No activity data available
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill={CHART_COLORS[0]}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--glass-bg)',
                    border: theme.glass.border,
                    borderRadius: theme.radius.sm,
                    color: 'var(--color-text-primary)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Activity Stats Bar Chart */}
      <div
        className="mb-8 rounded-2xl p-6"
        style={{
          background: theme.glass.background,
          border: theme.glass.border,
          boxShadow: theme.glass.shadow,
        }}
      >
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: theme.colors.textPrimary }}
        >
          Activity Distribution
        </h2>
        {Object.keys(activityStats).length === 0 ? (
          <p className="text-sm" style={{ color: theme.colors.textMuted }}>
            No activity data available
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={Object.entries(activityStats)
                .map(([name, value]) => ({
                  name: formatActivityAction(name),
                  value,
                }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 8)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" opacity={0.8} />
              <XAxis
                dataKey="name"
                stroke="var(--color-text-muted)"
                style={{ fontSize: '11px' }}
                tick={{ fill: 'var(--color-text-muted)' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="var(--color-text-muted)"
                style={{ fontSize: '12px' }}
                tick={{ fill: 'var(--color-text-muted)' }}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--glass-bg)',
                  border: theme.glass.border,
                  borderRadius: theme.radius.sm,
                  color: 'var(--color-text-primary)',
                }}
              />
              <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Activity Stats List & Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div
          className="rounded-2xl p-6 glass-animated transition-all duration-300 hover:scale-[1.01]"
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
            Activity by Type
          </h2>
          {Object.keys(activityStats).length === 0 ? (
            <p className="text-sm" style={{ color: theme.colors.textMuted }}>
              No activity data available
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(activityStats)
                .sort(([, a], [, b]) => b - a)
                .map(([action, count], idx) => (
                  <div
                    key={action}
                    className="flex items-center justify-between p-3 rounded-xl transition-colors"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: theme.glass.border,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getActivityIcon(action)}</span>
                      <span
                        className="text-sm font-medium"
                        style={{ color: theme.colors.textPrimary }}
                      >
                        {formatActivityAction(action)}
                      </span>
                    </div>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: CHART_COLORS[idx % CHART_COLORS.length] }}
                    >
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Recent Activity Timeline */}
        <div
          className="rounded-2xl p-6 glass-animated transition-all duration-300 hover:scale-[1.01]"
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
            Recent Activity Logs
          </h2>
          {data.activities.length === 0 ? (
            <p className="text-sm" style={{ color: theme.colors.textMuted }}>
              No recent activity
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {data.activities.slice(0, 20).map((activity) => {
                const metadata = activity.metadata
                  ? JSON.parse(activity.metadata)
                  : {}
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: theme.glass.border,
                    }}
                  >
                    <div className="text-xl">
                      {getActivityIcon(activity.action)}
                    </div>
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
      </div>
    </div>
  )
}
