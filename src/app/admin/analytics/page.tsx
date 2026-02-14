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

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']

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
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-stone-600 dark:text-gray-400">Loading analytics...</div>
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
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white mb-1">
          Analytics Dashboard
        </h1>
        <p className="text-stone-600 dark:text-gray-400">
          Comprehensive insights into your platform's performance and user
          activity.
        </p>
      </div>

      {/* Key Metrics KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 shadow-lg text-white">
          <div className="text-3xl mb-2">🏠</div>
          <div className="text-3xl font-bold mb-1">{data.totalProperties}</div>
          <div className="text-sm opacity-90">Total Properties</div>
          <div className="text-xs mt-2 opacity-75">
            +{data.propertiesLast30Days} this month
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg text-white">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-3xl font-bold mb-1">{data.totalUsers}</div>
          <div className="text-sm opacity-90">Total Users</div>
          <div className="text-xs mt-2 opacity-75">
            +{data.usersLast30Days} this month
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 shadow-lg text-white">
          <div className="text-3xl mb-2">✨</div>
          <div className="text-3xl font-bold mb-1">{data.activeUsers}</div>
          <div className="text-sm opacity-90">Active Users</div>
          <div className="text-xs mt-2 opacity-75">Last 30 days</div>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 shadow-lg text-white">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-3xl font-bold mb-1">{data.activities.length}</div>
          <div className="text-sm opacity-90">Total Activities</div>
          <div className="text-xs mt-2 opacity-75">Tracked events</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Activity Trend Line Chart */}
        <div className="bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">
            Activity Trend (Last 7 Days)
          </h2>
          {chartDailyStats.length === 0 ? (
            <p className="text-sm text-stone-500 dark:text-gray-400">
              No activity data available
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartDailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="activities"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Activities"
                  dot={{ fill: '#10b981', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="properties"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Properties"
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Users"
                  dot={{ fill: '#8b5cf6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Activity Breakdown Pie Chart */}
        <div className="bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">
            Activity Breakdown
          </h2>
          {pieData.length === 0 ? (
            <p className="text-sm text-stone-500 dark:text-gray-400">
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
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Activity Stats Bar Chart */}
      <div className="mb-8 bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">
          Activity Distribution
        </h2>
        {Object.keys(activityStats).length === 0 ? (
          <p className="text-sm text-stone-500 dark:text-gray-400">
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
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                style={{ fontSize: '11px' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Activity Stats List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">
            Activity Breakdown
          </h2>
          {Object.keys(activityStats).length === 0 ? (
            <p className="text-sm text-stone-500 dark:text-gray-400">
              No activity data available
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(activityStats)
                .sort(([, a], [, b]) => b - a)
                .map(([action, count]) => (
                  <div
                    key={action}
                    className="flex items-center justify-between p-3 rounded-lg bg-stone-50 dark:bg-gray-900/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getActivityIcon(action)}</span>
                      <span className="text-sm font-medium text-stone-900 dark:text-white">
                        {formatActivityAction(action)}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">
            Recent Activity Logs
          </h2>
          {data.activities.length === 0 ? (
            <p className="text-sm text-stone-500 dark:text-gray-400">
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
                    className="flex items-start gap-3 p-3 rounded-lg bg-stone-50 dark:bg-gray-900/50 border border-stone-200 dark:border-gray-700"
                  >
                    <div className="text-xl">
                      {getActivityIcon(activity.action)}
                    </div>
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
      </div>
    </div>
  )
}
