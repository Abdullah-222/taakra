'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { theme } from '@/lib/theme'
import { useAuth } from '@/hooks/useAuth'

export function AIInsights() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadInsights()
    }
  }, [user])

  const loadInsights = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/trends')
      const data = await response.json()

      if (data.success && data.summary) {
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Error loading AI insights:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div
      className="p-6 rounded-2xl backdrop-blur-xl glass-animated transition-all duration-300 hover:scale-[1.01]"
      style={{
        background: theme.glass.background,
        border: theme.glass.border,
        boxShadow: theme.glass.shadow,
        borderRadius: theme.radius.lg,
        backdropFilter: theme.glass.blur,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <h2
            className="text-xl font-bold"
            style={{ color: theme.colors.textPrimary }}
          >
            AI Insights
          </h2>
        </div>
        <button
          onClick={loadInsights}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 disabled:opacity-50"
          style={{
            background: loading
              ? 'rgba(59, 130, 246, 0.3)'
              : theme.buttons.primary.background,
            color: theme.buttons.primary.color,
            borderRadius: theme.radius.sm,
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && !summary ? (
        <div className="text-center py-8">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent mx-auto" />
          <p className="mt-2 text-sm" style={{ color: theme.colors.textMuted }}>
            Generating insights...
          </p>
        </div>
      ) : summary ? (
        <div
          className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="my-2 pl-5 list-disc space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="my-2 pl-5 list-decimal space-y-1">{children}</ol>,
              li: ({ children }) => <li className="my-0.5">{children}</li>,
              strong: ({ children }) => (
                <strong className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {children}
                </strong>
              ),
              h1: ({ children }) => (
                <h1 className="text-lg font-bold mt-4 mb-2 first:mt-0" style={{ color: 'var(--color-text-primary)' }}>
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-base font-bold mt-3 mb-2 first:mt-0" style={{ color: 'var(--color-text-primary)' }}>
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-sm font-semibold mt-2 mb-1 first:mt-0" style={{ color: 'var(--color-text-primary)' }}>
                  {children}
                </h3>
              ),
            }}
          >
            {summary}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="text-sm" style={{ color: theme.colors.textMuted }}>
          Click Refresh to generate AI insights about your platform.
        </p>
      )}
    </div>
  )
}

