'use client'

import { useEffect, useState } from 'react'
import { theme } from '@/lib/theme'
import { toast } from '@/components/ui/ToasterProvider'

const REPORT_CARDS = [
  {
    id: 'users' as const,
    title: 'Users',
    description: 'Export all users: email, name, role, snow points, and join date.',
    icon: '👥',
  },
  {
    id: 'competitions' as const,
    title: 'Competitions',
    description: 'All competitions with category, status, deadline, prize, and registration count.',
    icon: '❄️',
  },
  {
    id: 'registrations' as const,
    title: 'Registrations & payments',
    description: 'Detailed registration and payment status for every competition entry.',
    icon: '📋',
  },
  {
    id: 'activity' as const,
    title: 'Activity log',
    description: 'Recent platform activity: logins, registrations, and admin actions.',
    icon: '📈',
  },
] as const

type ReportType = (typeof REPORT_CARDS)[number]['id']

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<ReportType | null>(null)
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
      } catch {
        // ignore
      }
    }
    logReportView()
  }, [logged])

  async function handleDownload(type: ReportType) {
    setDownloading(type)
    try {
      const res = await fetch(`/api/admin/reports/download?type=${type}`, { credentials: 'include' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to generate report')
      }
      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition')
      const match = disposition?.match(/filename="(.+)"/)
      const filename = match?.[1] ?? `taakra-${type}-${new Date().toISOString().slice(0, 10)}.csv`
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Report downloaded: ${filename}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to download report')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1" style={{ color: theme.colors.textPrimary }}>
          Reports
        </h1>
        <p className="text-sm sm:text-base" style={{ color: theme.colors.textMuted }}>
          Download detailed CSV reports. Each report includes current data as of now.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {REPORT_CARDS.map((card) => {
          const isDownloading = downloading === card.id
          return (
            <div
              key={card.id}
              className="rounded-2xl overflow-hidden transition-all hover:shadow-lg"
              style={{
                background: theme.glass.background,
                border: theme.glass.border,
                boxShadow: theme.glass.shadow,
              }}
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <span
                    className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0 text-2xl"
                    style={{
                      background: 'color-mix(in srgb, var(--color-glacier-500) 14%, transparent)',
                      border: theme.glass.border,
                    }}
                  >
                    {card.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold mb-1" style={{ color: theme.colors.textPrimary }}>
                      {card.title}
                    </h2>
                    <p className="text-sm mb-4" style={{ color: theme.colors.textMuted }}>
                      {card.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDownload(card.id)}
                      disabled={!!downloading}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none"
                      style={{
                        background: theme.buttons.primary.background,
                        color: theme.buttons.primary.color,
                        boxShadow: theme.buttons.primary.shadow,
                      }}
                    >
                      {isDownloading ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Generating…
                        </>
                      ) : (
                        'Download report'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div
        className="mt-8 rounded-2xl p-5 sm:p-6"
        style={{
          background: theme.glass.background,
          border: theme.glass.border,
          boxShadow: theme.glass.shadow,
        }}
      >
        <h2 className="text-lg font-bold mb-2" style={{ color: theme.colors.textPrimary }}>
          About these reports
        </h2>
        <p className="text-sm" style={{ color: theme.colors.textMuted }}>
          Reports are generated as CSV files you can open in Excel or Google Sheets. Activity log includes the most recent 5,000 entries. Refresh the page and download again to get the latest data.
        </p>
      </div>
    </div>
  )
}
