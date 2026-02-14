'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/components/ui/ToasterProvider'
import { theme } from '@/lib/theme'
import { UserAvatar } from '@/components/chat/UserAvatar'

type Author = {
  id: number
  email: string
  name: string | null
  imageUrl: string | null
  role: string | null
}

type SupportMessage = {
  id: number
  content: string
  author: Author
  createdAt: string
}

type SupportConversation = {
  id: number
  subject: string | null
  status: string
  createdAt: string
  updatedAt: string
  user: {
    id: number
    email: string
    name: string | null
    imageUrl: string | null
  }
  messages: SupportMessage[]
  _count?: {
    messages: number
  }
}

export default function AdminSupportPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<SupportConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<SupportConversation | null>(null)
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchConversations = useCallback(async () => {
    try {
      const url = statusFilter !== 'all' ? `/api/support/conversations?status=${statusFilter}` : '/api/support/conversations'
      const res = await fetch(url)
      const data = await res.json()
      if (res.ok) {
        setConversations(data.conversations || [])
        if (data.conversations?.length > 0 && !selectedConversation) {
          await fetchConversationDetails(data.conversations[0].id)
        }
      } else {
        toast.error(data.error || 'Failed to load conversations')
      }
    } catch {
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, selectedConversation])

  const fetchConversationDetails = useCallback(async (conversationId: number) => {
    try {
      const res = await fetch(`/api/support/conversations/${conversationId}`)
      const data = await res.json()
      if (res.ok) {
        setSelectedConversation(data.conversation)
      } else {
        toast.error(data.error || 'Failed to load conversation')
      }
    } catch {
      toast.error('Failed to load conversation')
    }
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    if (messagesEndRef.current && selectedConversation) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedConversation])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedConversation || !input.trim()) {
      return
    }

    const tempMessage: SupportMessage = {
      id: Date.now(),
      content: input.trim(),
      author: {
        id: user.id,
        email: user.email,
        name: user.name,
        imageUrl: user.imageUrl,
        role: user.role,
      },
      createdAt: new Date().toISOString(),
    }

    // Optimistic update
    setSelectedConversation((prev) =>
      prev ? { ...prev, messages: [...prev.messages, tempMessage] } : null
    )
    setInput('')
    setSubmitting(true)

    try {
      const res = await fetch(`/api/support/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: tempMessage.content }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      // Refresh conversation
      await fetchConversationDetails(selectedConversation.id)
      await fetchConversations()
    } catch (err) {
      // Rollback optimistic update
      setSelectedConversation((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.filter((m) => m.id !== tempMessage.id),
            }
          : null
      )
      toast.error(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (conversationId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/support/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update status')
      }

      toast.success(`Conversation marked as ${newStatus}`)
      await fetchConversations()
      if (selectedConversation?.id === conversationId) {
        await fetchConversationDetails(conversationId)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status')
    }
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - d.getTime()

    if (diff < 60000) return 'now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const unreadCount = conversations.filter((c) => c.status === 'open').length

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1
            className="text-2xl md:text-3xl font-bold"
            style={{ color: theme.colors.textPrimary }}
          >
            Support Management
          </h1>
          {unreadCount > 0 && (
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                background: `${theme.colors.danger}20`,
                color: theme.colors.danger,
              }}
            >
              {unreadCount} open
            </span>
          )}
        </div>
        <p className="text-sm" style={{ color: theme.colors.textMuted }}>
          Manage support conversations and help users with their questions.
        </p>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Conversations sidebar */}
        <div
          className="w-80 flex-shrink-0 flex flex-col rounded-xl overflow-hidden"
          style={{
            border: theme.glass.border,
            background: theme.glass.background,
            boxShadow: theme.glass.shadow,
          }}
        >
          <div
            className="p-4 border-b"
            style={{ borderColor: 'var(--glass-border)' }}
          >
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{
                background: 'var(--input-bg)',
                border: 'var(--input-border)',
                color: 'var(--input-text)',
              }}
            >
              <option value="all">All conversations</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm" style={{ color: theme.colors.textMuted }}>
                Loading...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-sm" style={{ color: theme.colors.textMuted }}>
                No conversations found.
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--glass-border)' }}>
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => fetchConversationDetails(conv.id)}
                    className={`w-full p-4 text-left transition-all ${
                      selectedConversation?.id === conv.id
                        ? 'opacity-100'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      background:
                        selectedConversation?.id === conv.id
                          ? 'var(--color-frost-50)'
                          : 'transparent',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-semibold text-sm truncate"
                          style={{ color: theme.colors.textPrimary }}
                        >
                          {conv.user.name || conv.user.email}
                        </p>
                        {conv.subject && (
                          <p
                            className="text-xs truncate mt-0.5"
                            style={{ color: theme.colors.textMuted }}
                          >
                            {conv.subject}
                          </p>
                        )}
                      </div>
                      <span
                        className="text-xs px-2 py-0.5 rounded shrink-0"
                        style={{
                          background:
                            conv.status === 'open'
                              ? `${theme.colors.success}20`
                              : `${theme.colors.textMuted}20`,
                          color:
                            conv.status === 'open'
                              ? theme.colors.success
                              : theme.colors.textMuted,
                        }}
                      >
                        {conv.status}
                      </span>
                    </div>
                    {conv.messages?.[0] && (
                      <p
                        className="text-xs truncate mb-1"
                        style={{ color: theme.colors.textMuted }}
                      >
                        {conv.messages[0].content.slice(0, 50)}
                        {conv.messages[0].content.length > 50 ? '...' : ''}
                      </p>
                    )}
                    <p
                      className="text-xs"
                      style={{ color: theme.colors.textMuted }}
                    >
                      {formatTime(conv.updatedAt)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Messages area */}
        <div
          className="flex-1 flex flex-col rounded-xl overflow-hidden"
          style={{
            border: theme.glass.border,
            background: theme.glass.background,
            boxShadow: theme.glass.shadow,
          }}
        >
          {selectedConversation ? (
            <>
              <div
                className="p-4 border-b"
                style={{ borderColor: 'var(--glass-border)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      userId={selectedConversation.user.id}
                      name={selectedConversation.user.name}
                      email={selectedConversation.user.email}
                      imageUrl={selectedConversation.user.imageUrl}
                      size="md"
                    />
                    <div>
                      <h2
                        className="font-semibold text-lg"
                        style={{ color: theme.colors.textPrimary }}
                      >
                        {selectedConversation.user.name || selectedConversation.user.email}
                      </h2>
                      <p
                        className="text-xs"
                        style={{ color: theme.colors.textMuted }}
                      >
                        {selectedConversation.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedConversation.status}
                      onChange={(e) =>
                        handleStatusChange(selectedConversation.id, e.target.value)
                      }
                      className="px-3 py-1.5 rounded-lg text-sm"
                      style={{
                        background: 'var(--input-bg)',
                        border: 'var(--input-border)',
                        color: 'var(--input-text)',
                      }}
                    >
                      <option value="open">Open</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                {selectedConversation.subject && (
                  <p
                    className="text-sm"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Subject: {selectedConversation.subject}
                  </p>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages.map((msg) => {
                  const isOwn = user && msg.author.id === user.id
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                    >
                      <UserAvatar
                        userId={msg.author.id}
                        name={msg.author.name}
                        email={msg.author.email}
                        imageUrl={msg.author.imageUrl}
                        role={msg.author.role}
                        size="md"
                      />
                      <div
                        className={`flex-1 max-w-[70%] ${isOwn ? 'text-right' : ''}`}
                      >
                        <div
                          className="inline-block p-3 rounded-2xl"
                          style={{
                            background: isOwn
                              ? theme.buttons.primary.background
                              : 'var(--glass-bg)',
                            border: theme.glass.border,
                          }}
                        >
                          <p
                            className="text-sm whitespace-pre-wrap break-words"
                            style={{
                              color: isOwn ? 'white' : theme.colors.textSecondary,
                            }}
                          >
                            {msg.content}
                          </p>
                        </div>
                        <p
                          className="text-xs mt-1"
                          style={{ color: theme.colors.textMuted }}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {selectedConversation.status !== 'closed' && (
                <div
                  className="p-4 border-t"
                  style={{ borderColor: 'var(--glass-border)' }}
                >
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage(e)
                        }
                      }}
                      placeholder="Type your reply... (Enter to send, Shift+Enter for new line)"
                      rows={2}
                      className="flex-1 px-4 py-3 rounded-xl text-sm resize-none"
                      style={{
                        background: 'var(--input-bg)',
                        border: 'var(--input-border)',
                        color: 'var(--input-text)',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={submitting || !input.trim()}
                      className="px-6 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-50"
                      style={{
                        background: theme.buttons.primary.background,
                      }}
                    >
                      {submitting ? 'Sending...' : 'Send'}
                    </button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p
                  className="text-lg mb-2"
                  style={{ color: theme.colors.textPrimary }}
                >
                  Select a conversation to view messages
                </p>
                <p
                  className="text-sm"
                  style={{ color: theme.colors.textMuted }}
                >
                  Help users by responding to their support requests
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

