'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { theme } from '@/lib/theme'
import { toast } from '@/components/ui/ToasterProvider'

interface PrepGuideProps {
  title: string
  description: string
  category: string
  rules?: string | null
}

export function PrepGuide({ title, description, category, rules }: PrepGuideProps) {
  const [guide, setGuide] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/prep-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category, rules: rules || undefined }),
      })

      const data = await response.json()

      if (data.success) {
        setGuide(data.guide)
        setShowGuide(true)
        toast.success('Preparation guide generated! ✨')
      } else {
        toast.error(data.error || 'Failed to generate guide')
      }
    } catch (error) {
      toast.error('Failed to generate preparation guide')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-6">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: loading
            ? 'rgba(59, 130, 246, 0.3)'
            : theme.buttons.primary.background,
          color: theme.buttons.primary.color,
          borderRadius: theme.radius.md,
        }}
      >
        {loading ? (
          <>
            <span className="animate-spin">⏳</span>
            <span>Generating Guide...</span>
          </>
        ) : (
          <>
            <span>📚</span>
            <span>Generate 7-Day Preparation Guide</span>
          </>
        )}
      </button>

      {showGuide && guide && (
        <div
          className="mt-4 p-6 rounded-xl backdrop-blur-xl"
          style={{
            background: theme.glass.background,
            border: theme.glass.border,
            borderRadius: theme.radius.lg,
          }}
        >
          <h3
            className="text-lg font-bold mb-4"
            style={{ color: theme.colors.textPrimary }}
          >
            Preparation Guide ✨
          </h3>
          <div
            className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="my-3 first:mt-0 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="my-3 pl-5 list-disc space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="my-3 pl-5 list-decimal space-y-1">{children}</ol>,
                li: ({ children }) => <li className="my-1">{children}</li>,
                strong: ({ children }) => (
                  <strong className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {children}
                  </strong>
                ),
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold mt-6 mb-3 first:mt-0" style={{ color: 'var(--color-text-primary)' }}>
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-bold mt-5 mb-2 first:mt-0" style={{ color: 'var(--color-text-primary)' }}>
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-semibold mt-4 mb-2 first:mt-0" style={{ color: 'var(--color-text-primary)' }}>
                    {children}
                  </h3>
                ),
              }}
            >
              {guide}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}


