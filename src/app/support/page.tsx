'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/components/ui/ToasterProvider'
import { theme } from '@/lib/theme'
import { Snowfall } from '@/components/ui/Snowfall'
import { HomeFooter } from '@/components/home/HomeFooter'
import { UserAvatar } from '@/components/chat/UserAvatar'
import Link from 'next/link'

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

export default function SupportPage() {
  const { user, loading: authLoading } = useAuth()
  const [conversations, setConversations] = useState<SupportConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<SupportConversation | null>(null)
  const [input, setInput] = useState('')
  const [subject, setSubject] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const fetchConversations = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch('/api/support/conversations')
      const data = await res.json()
      if (res.ok) {
        setConversations(data.conversations || [])
        if (data.conversations?.length > 0 && !selectedConversation) {
          // Auto-select first conversation
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
  }, [user, selectedConversation])

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
    if (!authLoading && user) {
      fetchConversations()
    }
  }, [authLoading, user, fetchConversations])

  useEffect(() => {
    if (messagesEndRef.current && selectedConversation) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedConversation])

  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !input.trim()) {
      toast.error('Please enter a message')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/support/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim() || undefined,
          content: input.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to create conversation')
        return
      }

      toast.success('Support request sent! We\'ll get back to you soon.')
      setInput('')
      setSubject('')
      setShowNewForm(false)
      await fetchConversations()
      if (data.conversation) {
        await fetchConversationDetails(data.conversation.id)
      }
    } catch {
      toast.error('Failed to send message')
    } finally {
      setSubmitting(false)
    }
  }

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

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: theme.colors.darkIce }}>
        <Snowfall />
        <main className="flex-1 flex items-center justify-center relative z-10">
          <span style={{ color: theme.colors.textMuted }}>Loading...</span>
        </main>
        <HomeFooter />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: theme.colors.darkIce }}>
        <Snowfall />
        <main className="flex-1 flex items-center justify-center relative z-10">
          <div className="text-center">
            <p className="text-lg mb-4" style={{ color: theme.colors.textPrimary }}>
              Please sign in to access support
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white"
              style={{
                background: theme.buttons.primary.background,
                boxShadow: theme.buttons.primary.shadow,
              }}
            >
              Sign In
            </Link>
          </div>
        </main>
        <HomeFooter />
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: theme.colors.darkIce }}
    >
      <Snowfall />
      <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 relative z-10">
        <div className="mb-6">
          <h1
            className="text-2xl md:text-3xl font-bold tracking-tight mb-2"
            style={{ color: theme.colors.textPrimary }}
          >
            Support Center
          </h1>
          <p className="text-sm" style={{ color: theme.colors.textMuted }}>
            Get help from our support team. Start a new conversation or continue an existing one.
          </p>
        </div>

        <div className="flex-1 flex gap-4 min-h-0">
          {/* Conversations sidebar */}
          <div
            className="w-80 flex-shrink-0 flex flex-col rounded-2xl overflow-hidden backdrop-blur-xl"
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
              <button
                onClick={() => setShowNewForm(!showNewForm)}
                className="w-full px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all"
                style={{
                  background: theme.buttons.primary.background,
                  boxShadow: theme.buttons.primary.shadow,
                }}
              >
                {showNewForm ? 'Cancel' : '+ New Conversation'}
              </button>
            </div>

            {showNewForm && (
              <div
                className="p-4 border-b"
                style={{ borderColor: 'var(--glass-border)' }}
              >
                <form onSubmit={handleCreateConversation} className="space-y-3">
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject (optional)"
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: 'var(--input-bg)',
                      border: 'var(--input-border)',
                      color: 'var(--input-text)',
                    }}
                  />
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Your message..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                    style={{
                      background: 'var(--input-bg)',
                      border: 'var(--input-border)',
                      color: 'var(--input-text)',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={submitting || !input.trim()}
                    className="w-full px-4 py-2 rounded-lg font-semibold text-sm text-white disabled:opacity-50"
                    style={{
                      background: theme.buttons.primary.background,
                    }}
                  >
                    {submitting ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-sm" style={{ color: theme.colors.textMuted }}>
                  Loading...
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-sm" style={{ color: theme.colors.textMuted }}>
                  No conversations yet. Start a new one!
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
                        <p
                          className="font-semibold text-sm truncate"
                          style={{ color: theme.colors.textPrimary }}
                        >
                          {conv.subject || 'No subject'}
                        </p>
                        <span
                          className="text-xs px-2 py-0.5 rounded"
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
                          {conv.messages[0].content.slice(0, 60)}
                          {conv.messages[0].content.length > 60 ? '...' : ''}
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
            className="flex-1 flex flex-col rounded-2xl overflow-hidden backdrop-blur-xl"
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h2
                        className="font-semibold text-lg"
                        style={{ color: theme.colors.textPrimary }}
                      >
                        {selectedConversation.subject || 'Support Conversation'}
                      </h2>
                      <p
                        className="text-xs mt-1"
                        style={{ color: theme.colors.textMuted }}
                      >
                        Status: {selectedConversation.status}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                  {selectedConversation.messages.map((msg) => {
                    const isOwn = msg.author.id === user.id
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
                        placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
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
                        Send
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
                    Select a conversation or start a new one
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: theme.colors.textMuted }}
                  >
                    Our support team is here to help!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  )
}


