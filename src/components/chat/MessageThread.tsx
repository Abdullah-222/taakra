'use client'

import { memo, useState } from 'react'
import { UserAvatar } from './UserAvatar'

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

  // Color coding for thread depth
  const getThreadColor = (level: number) => {
    const colors = [
      'border-emerald-400 dark:border-emerald-600',
      'border-blue-400 dark:border-blue-600',
      'border-purple-400 dark:border-purple-600',
      'border-pink-400 dark:border-pink-600',
      'border-orange-400 dark:border-orange-600',
      'border-cyan-400 dark:border-cyan-600',
    ]
    return colors[level % colors.length]
  }

  return (
    <div
      className={`
        ${isNested ? 'relative pl-4 sm:pl-6 ml-2 sm:ml-3 border-l-2' : ''} 
        ${isNested ? getThreadColor(depth - 1) : ''}
        transition-all duration-200
      `}
    >
      {/* Connection dot for nested messages */}
      {isNested && (
        <div
          className={`
            absolute -left-[9px] top-6 w-2 h-2 rounded-full 
            border-2 border-white dark:border-gray-900
            ${depth === 1 ? 'bg-emerald-500' : depth === 2 ? 'bg-blue-500' : depth === 3 ? 'bg-purple-500' : depth === 4 ? 'bg-pink-500' : 'bg-orange-500'}
          `}
        />
      )}

      <div
        className={`
          group rounded-2xl p-3 sm:p-4 transition-all duration-200
          inline-block max-w-3xl
          ${message._optimistic 
            ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-2 border-emerald-200 dark:border-emerald-800 animate-pulse' 
            : 'bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 hover:border-stone-300 dark:hover:border-gray-600'
          }
          ${isOwnMessage ? 'ring-1 ring-emerald-500/20' : ''}
          shadow-sm hover:shadow-md
        `}
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
                <span className="font-semibold text-stone-900 dark:text-white text-[13px] truncate">
                  {displayName}
                </span>
                {message.author.role === 'admin' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                    ADMIN
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowFullDate(!showFullDate)}
                className="text-xs text-stone-500 dark:text-gray-400 hover:text-stone-700 dark:hover:text-gray-300 transition-colors shrink-0"
                title={formatFullDate(message.createdAt)}
              >
                {showFullDate ? formatFullDate(message.createdAt) : formatTime(message.createdAt)}
              </button>
            </div>

            <p className="text-stone-700 dark:text-gray-300 text-[13px] leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>

            <div className="flex items-center gap-2 mt-2">
              {canReply && onReply && (
                <button
                  type="button"
                  onClick={() => onReply(message)}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-stone-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
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
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-stone-600 dark:text-gray-400 hover:text-stone-900 dark:hover:text-gray-200 hover:bg-stone-100 dark:hover:bg-gray-700 transition-all"
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

      {/* Nested replies */}
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
