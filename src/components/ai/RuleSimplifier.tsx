'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { theme } from '@/lib/theme'
import { toast } from '@/components/ui/ToasterProvider'

interface RuleSimplifierProps {
  rules: string
  competitionTitle: string
}

export function RuleSimplifier({ rules, competitionTitle }: RuleSimplifierProps) {
  const [simplified, setSimplified] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSimplified, setShowSimplified] = useState(false)

  const handleSimplify = async () => {
    if (!rules.trim()) {
      toast.error('No rules to simplify')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/ai/simplify-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules, competitionTitle }),
      })

      const data = await response.json()

      if (data.success) {
        setSimplified(data.simplified)
        setShowSimplified(true)
        toast.success('Rules simplified! ✨')
      } else {
        toast.error(data.error || 'Failed to simplify rules')
      }
    } catch (error) {
      toast.error('Failed to simplify rules')
    } finally {
      setLoading(false)
    }
  }

  if (!rules.trim()) {
    return null
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-xs uppercase tracking-wider"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Rules of competition
        </p>
        <button
          onClick={handleSimplify}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: loading
              ? 'rgba(59, 130, 246, 0.3)'
              : theme.buttons.primary.background,
            color: theme.buttons.primary.color,
            borderRadius: theme.radius.sm,
          }}
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              <span>Simplifying...</span>
            </>
          ) : (
            <>
              <span>🤖</span>
              <span>Simplify Rules</span>
            </>
          )}
        </button>
      </div>

      {showSimplified && simplified ? (
        <div
          className="p-4 rounded-xl backdrop-blur-xl"
          style={{
            background: theme.glass.background,
            border: theme.glass.border,
            borderRadius: theme.radius.md,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3
              className="text-sm font-semibold"
              style={{ color: theme.colors.textPrimary }}
            >
              Simplified Rules ✨
            </h3>
            <button
              onClick={() => setShowSimplified(false)}
              className="text-xs"
              style={{ color: theme.colors.textMuted }}
            >
              Show Original
            </button>
          </div>
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
              {simplified}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
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
            }}
          >
            {rules}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}


