'use client'

import { memo, useState } from 'react'
import { UserAvatar } from './UserAvatar'
import { theme } from '@/lib/theme'

export type Author = {
  id: number
  email: string
  name: string | null
  imageUrl?: string | null
  role?: string | null
}

export type Message = {
  id: number | string
  content: string
  author: Author
  createdAt: string
  replies?: Message[]
  _optimistic?: boolean
}

type MessageThreadProps = {
  message: Message
  depth?: number
  maxDepth?: number
  onReply?: (message: Message) => void
  currentUserId?: number | null
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  if (diff < 60000) return 'now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`

  const isToday = d.toDateString() === now.toDateString()
  if (isToday) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const isThisYear = d.getFullYear() === now.getFullYear()
  if (isThisYear) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatFullDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

const depthBorderColors = [
  'var(--color-frost-300)',
  'var(--color-glacier-500)',
  'var(--color-frost-400)',
  'var(--color-glacier-600)',
  'var(--color-frost-200)',
  'var(--color-glacier-500)',
]

const depthDotColors = [
  'var(--color-frost-400)',
  'var(--color-glacier-500)',
  'var(--color-frost-300)',
  'var(--color-glacier-600)',
  'var(--color-frost-400)',
  'var(--color-glacier-500)',
]

const MessageThreadComponent = ({
  message,
  depth = 0,
  maxDepth = 6,
  onReply,
  currentUserId,
}: MessageThreadProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const [showFullDate, setShowFullDate] = useState(false)

  const isNested = depth > 0
  const hasReplies = message.replies && message.replies.length > 0
  const canReply = currentUserId && depth < maxDepth
  const isOwnMessage = currentUserId === message.author.id

  const displayName = message.author.name?.trim() || message.author.email.split('@')[0] || 'Anonymous'
  const borderColor = isNested ? depthBorderColors[(depth - 1) % depthBorderColors.length] : 'transparent'
  const dotColor = isNested ? depthDotColors[(depth - 1) % depthDotColors.length] : 'transparent'

  return (
    <div
      className={`${isNested ? 'relative pl-4 sm:pl-6 ml-2 sm:ml-3 border-l-2' : ''} transition-all duration-200`}
      style={isNested ? { borderColor } : undefined}
    >
      {isNested && (
        <div
          className="absolute -left-[9px] top-6 w-2 h-2 rounded-full border-2 border-[var(--glass-border)]"
          style={{ background: dotColor }}
        />
      )}

      <div
        className={`group rounded-2xl p-3 sm:p-4 transition-all duration-200 inline-block max-w-3xl min-w-0 ${message._optimistic ? 'animate-pulse' : ''}`}
        style={{
          background: message._optimistic
            ? 'var(--color-frost-50)'
            : 'var(--glass-bg)',
          border: message._optimistic
            ? `2px solid ${theme.colors.frost300}`
            : theme.glass.border,
          boxShadow: message._optimistic ? 'none' : (isOwnMessage ? theme.glow.subtle : theme.glass.shadow),
        }}
      >
        <div className="flex items-start gap-3">
          <UserAvatar
            userId={message.author.id}
            name={message.author.name}
            email={message.author.email}
            imageUrl={message.author.imageUrl}
            role={message.author.role}
            size="md"
            showTooltip={true}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="font-semibold text-[13px] truncate"
                  style={{ color: theme.colors.textPrimary }}
                >
                  {displayName}
                </span>
                {message.author.role === 'admin' && (
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                    style={{
                      background: 'var(--color-frost-100)',
                      color: theme.colors.glacier500,
                      border: `1px solid var(--color-frost-300)`,
                    }}
                  >
                    ADMIN
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowFullDate(!showFullDate)}
                className="text-xs shrink-0 transition-colors hover:opacity-80"
                style={{ color: theme.colors.textMuted }}
                title={formatFullDate(message.createdAt)}
              >
                {showFullDate ? formatFullDate(message.createdAt) : formatTime(message.createdAt)}
              </button>
            </div>

            <p
              className="text-[13px] leading-relaxed whitespace-pre-wrap break-words"
              style={{ color: theme.colors.textSecondary }}
            >
              {message.content}
            </p>

            <div className="flex items-center gap-2 mt-2">
              {canReply && onReply && (
                <button
                  type="button"
                  onClick={() => onReply(message)}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-90"
                  style={{
                    color: theme.colors.frost400,
                  }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Reply
                </button>
              )}
              {hasReplies && (
                <button
                  type="button"
                  onClick={() => setCollapsed(!collapsed)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                  style={{ color: theme.colors.textMuted }}
                >
                  {collapsed ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Show {message.replies!.length} {message.replies!.length === 1 ? 'reply' : 'replies'}
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      Hide {message.replies!.length} {message.replies!.length === 1 ? 'reply' : 'replies'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {hasReplies && !collapsed && (
        <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {message.replies!.map((reply) => (
            <MessageThreadComponent
              key={reply.id}
              message={reply}
              depth={depth + 1}
              maxDepth={maxDepth}
              onReply={onReply}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const MessageThread = memo(MessageThreadComponent)
