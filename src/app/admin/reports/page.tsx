'use client'

import { useEffect, useState } from 'react'

export default function ReportsPage() {
  const [logged, setLogged] = useState(false)

  useEffect(() => {
    async function logReportView() {
      if (logged) return
      try {
        await fetch('/api/admin/reports/view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
        setLogged(true)
      } catch (error) {
        console.error('Failed to log report view:', error)
      }
    }
    logReportView()
  }, [logged])

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white mb-1">
          Reports
        </h1>
        <p className="text-stone-600 dark:text-gray-400">
          Generate and export detailed reports about your platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">
            Property Reports
          </h3>
          <p className="text-sm text-stone-600 dark:text-gray-400 mb-4">
            Generate comprehensive reports on all property listings, including
            creation dates, views, and performance metrics.
          </p>
          <button
            type="button"
            className="w-full px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Generate Report
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <div className="text-3xl mb-3">👥</div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">
            User Reports
          </h3>
          <p className="text-sm text-stone-600 dark:text-gray-400 mb-4">
            Export user data, registration trends, activity logs, and user
            engagement statistics.
          </p>
          <button
            type="button"
            className="w-full px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Generate Report
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <div className="text-3xl mb-3">📈</div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">
            Analytics Reports
          </h3>
          <p className="text-sm text-stone-600 dark:text-gray-400 mb-4">
            Create detailed analytics reports with charts, graphs, and KPI
            summaries for executive review.
          </p>
          <button
            type="button"
            className="w-full px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Generate Report
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <div className="text-3xl mb-3">🔍</div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">
            Activity Logs
          </h3>
          <p className="text-sm text-stone-600 dark:text-gray-400 mb-4">
            Export complete activity logs with filters for date ranges, action
            types, and user-specific activities.
          </p>
          <button
            type="button"
            className="w-full px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Export Logs
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <div className="text-3xl mb-3">💼</div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">
            Performance Reports
          </h3>
          <p className="text-sm text-stone-600 dark:text-gray-400 mb-4">
            Analyze platform performance metrics, response times, and system
            health indicators.
          </p>
          <button
            type="button"
            className="w-full px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Generate Report
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <div className="text-3xl mb-3">📅</div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">
            Custom Reports
          </h3>
          <p className="text-sm text-stone-600 dark:text-gray-400 mb-4">
            Create custom reports with your own filters, date ranges, and data
            selections.
          </p>
          <button
            type="button"
            className="w-full px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Create Custom Report
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">
          Report History
        </h2>
        <p className="text-sm text-stone-500 dark:text-gray-400">
          Your generated reports will appear here. This feature is coming soon.
        </p>
      </div>
    </div>
  )
}
