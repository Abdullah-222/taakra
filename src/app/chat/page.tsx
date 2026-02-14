'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { HomeFooter } from '@/components/home/HomeFooter'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/components/ui/ToasterProvider'
import { MessageThread, type Message, type Author } from '@/components/chat/MessageThread'
import { UserAvatar } from '@/components/chat/UserAvatar'
import { Snowfall } from '@/components/ui/Snowfall'
import { theme } from '@/lib/theme'

const EmojiPicker = dynamic(
  () => import('emoji-picker-react').then((mod) => mod.default),
  { ssr: false }
)

function displayName(a: Author) {
  return a.name?.trim() || a.email.split('@')[0] || 'Anonymous'
}

function injectOptimistic(
  list: Message[],
  parentId: number | null,
  optimistic: Message
): Message[] {
  if (parentId === null) {
    return [...list, optimistic]
  }
  return list.map((m) => {
    if (m.id === parentId) {
      return { ...m, replies: [...(m.replies || []), optimistic] }
    }
    if (m.replies?.length) {
      return { ...m, replies: injectOptimistic(m.replies, parentId, optimistic) }
    }
    return m
  })
}

function removeOptimistic(list: Message[], tempId: string | number): Message[] {
  return list
    .filter((m) => m.id !== tempId)
    .map((m) => {
      if (m.replies?.length) {
        return { ...m, replies: removeOptimistic(m.replies, tempId) }
      }
      return m
    })
}

export default function CommunityChatPage() {
  const { user, loading: authLoading } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showEmoji, setShowEmoji] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const feedRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/messages')
      const data = await res.json()
      setMessages(data.messages || [])
    } catch {
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  useEffect(() => {
    if (feedRef.current && messages.length && autoScroll) {
      feedRef.current.scrollTo({
        top: feedRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages.length, autoScroll])

  const handleScroll = useCallback(() => {
    if (!feedRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = feedRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
    setAutoScroll(isNearBottom)
  }, [])

  const scrollToBottom = useCallback(() => {
    if (!feedRef.current) return
    feedRef.current.scrollTo({
      top: feedRef.current.scrollHeight,
      behavior: 'smooth',
    })
    setAutoScroll(true)
  }, [])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !input.trim()) {
      if (!user) toast.error('Sign in to send messages')
      return
    }
    const contentToSend = input.trim()
    const parentId = replyingTo?.id != null && typeof replyingTo.id === 'number' ? replyingTo.id : null
    const tempId = `opt-${Date.now()}`
    const optimisticMsg: Message = {
      id: tempId,
      content: contentToSend,
      author: {
        id: user.id,
        email: user.email,
        name: user.name ?? null,
        imageUrl: user.imageUrl ?? null,
        role: user.role ?? null
      },
      createdAt: new Date().toISOString(),
      replies: [],
      _optimistic: true,
    }

    setMessages((prev) => injectOptimistic(prev, parentId, optimisticMsg))
    setInput('')
    setReplyingTo(null)
    setShowEmoji(false)
    setSubmitting(true)

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contentToSend, parentId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      await fetchMessages()
    } catch (err: unknown) {
      setMessages((prev) => removeOptimistic(prev, tempId))
      toast.error(err instanceof Error ? err.message : 'Failed to send')
    } finally {
      setSubmitting(false)
    }
  }

  function onEmojiClick(emojiData: { emoji: string }) {
    setInput((prev) => prev + emojiData.emoji)
    inputRef.current?.focus()
  }

  const messageCount = useMemo(() => {
    const countMessages = (msgs: Message[]): number => {
      return msgs.reduce((acc, msg) => {
        return acc + 1 + (msg.replies ? countMessages(msg.replies) : 0)
      }, 0)
    }
    return countMessages(messages)
  }, [messages])

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

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: theme.colors.darkIce }}
    >
      <Snowfall />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${theme.colors.frost100}18 0%, transparent 50%)`,
        }}
      />

      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 relative z-10">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1
                className="text-2xl md:text-3xl font-bold tracking-tight"
                style={{ color: theme.colors.textPrimary }}
              >
                Community Chat
              </h1>
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  background: theme.glass.background,
                  border: theme.glass.border,
                  boxShadow: theme.glass.shadow,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: theme.colors.frost400 }}
                />
                <span className="text-xs font-semibold" style={{ color: theme.colors.frost300 }}>
                  {messageCount} {messageCount === 1 ? 'message' : 'messages'}
                </span>
              </div>
            </div>
            <p className="text-sm mt-1" style={{ color: theme.colors.textMuted }}>
              Join the conversation. Reply to threads. ❄️
            </p>
          </div>
          {!user && (
            <Link
              href="/login"
              className="inline-flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-xl font-semibold text-sm shadow-lg transition-all whitespace-nowrap"
              style={{
                background: theme.buttons.primary.background,
                color: theme.buttons.primary.color,
                boxShadow: theme.buttons.primary.shadow,
              }}
            >
              Sign in
            </Link>
          )}
        </div>

        <div
          className="flex-1 flex flex-col min-h-0 rounded-2xl overflow-hidden backdrop-blur-xl"
          style={{
            border: theme.glass.border,
            background: theme.glass.background,
            boxShadow: theme.glass.shadow,
            borderRadius: theme.radius.lg,
          }}
        >
          {/* Header bar */}
          <div
            className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b min-h-[56px]"
            style={{
              borderColor: 'var(--glass-border)',
              background: 'var(--color-frost-50)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: theme.colors.frost400 }}
                />
                <div
                  className="absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping opacity-75"
                  style={{ background: theme.colors.frost400 }}
                />
              </div>
              <span className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
                Live Chat
              </span>
            </div>
            {!autoScroll && (
              <button
                type="button"
                onClick={scrollToBottom}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all"
                style={{
                  background: theme.buttons.primary.background,
                  boxShadow: theme.buttons.primary.shadow,
                }}
              >
                ↓ New messages
              </button>
            )}
          </div>

          {/* Message feed */}
          <div
            ref={feedRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-[320px] scroll-smooth"
            style={{ background: 'var(--glass-bg)' }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
                      style={{
                        borderColor: `${theme.colors.frost300}40`,
                        borderTopColor: theme.colors.glacier500,
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
                      Loading chat...
                    </p>
                    <p className="text-xs mt-1" style={{ color: theme.colors.textMuted }}>
                      Fetching latest messages
                    </p>
                  </div>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5"
                  style={{
                    background: theme.glass.background,
                    border: theme.glass.border,
                    boxShadow: theme.glass.shadow,
                  }}
                >
                  💬
                </div>
                <p className="text-lg font-semibold" style={{ color: theme.colors.textPrimary }}>
                  No messages yet
                </p>
                <p className="text-sm mt-2 max-w-xs" style={{ color: theme.colors.textMuted }}>
                  {user ? 'Be the first to start the conversation!' : 'Sign in to join the discussion.'}
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageThread
                  key={msg.id}
                  message={msg}
                  depth={0}
                  maxDepth={6}
                  onReply={(target) => {
                    setReplyingTo(target)
                    inputRef.current?.focus()
                  }}
                  currentUserId={user?.id}
                />
              ))
            )}
          </div>

          {user && (
            <div
              className="p-4 border-t"
              style={{
                borderColor: 'var(--glass-border)',
                background: 'var(--color-frost-50)',
              }}
            >
              {replyingTo && (
                <div
                  className="flex items-center gap-3 mb-3 px-3 py-2.5 rounded-xl"
                  style={{
                    background: theme.glass.background,
                    border: theme.glass.border,
                    boxShadow: theme.glass.shadow,
                  }}
                >
                  <UserAvatar
                    userId={replyingTo.author.id}
                    name={replyingTo.author.name}
                    email={replyingTo.author.email}
                    imageUrl={replyingTo.author.imageUrl}
                    role={replyingTo.author.role}
                    size="sm"
                    showTooltip={false}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: theme.colors.frost400 }}
                      >
                        Replying to
                      </span>
                      <span
                        className="text-sm font-semibold truncate"
                        style={{ color: theme.colors.textPrimary }}
                      >
                        {displayName(replyingTo.author)}
                      </span>
                    </div>
                    <p
                      className="text-xs truncate mt-0.5"
                      style={{ color: theme.colors.textMuted }}
                    >
                      {replyingTo.content.slice(0, 60)}{replyingTo.content.length > 60 ? '…' : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
                    style={{ color: theme.colors.textMuted }}
                    aria-label="Cancel reply"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <form onSubmit={handleSend} className="relative">
                <div
                  className="chat-input-wrap flex gap-2 items-end rounded-2xl transition-all"
                  style={{
                    border: theme.inputs.border,
                    background: theme.inputs.background,
                    borderRadius: theme.radius.md,
                    boxShadow: 'none',
                  }}
                >
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setShowEmoji(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend(e)
                      }
                    }}
                    placeholder={replyingTo ? `Reply to ${displayName(replyingTo.author)}...` : 'Type your message... (Enter to send, Shift+Enter for new line)'}
                    rows={2}
                    className="flex-1 min-h-[52px] max-h-32 resize-none bg-transparent px-4 py-3 placeholder:opacity-70 focus:outline-none text-sm rounded-2xl min-w-0"
                    style={{ color: 'var(--input-text)' }}
                  />
                  <div className="flex items-center gap-1 pr-2 pb-2">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowEmoji((e) => !e)}
                        className="p-2 rounded-xl transition-colors hover:opacity-80"
                        style={{ color: theme.colors.textMuted }}
                        title="Add emoji"
                      >
                        <span className="text-xl">😊</span>
                      </button>
                      {showEmoji && (
                        <div className="absolute bottom-full right-0 mb-2 z-50 shadow-2xl rounded-xl overflow-hidden">
                          <EmojiPicker
                            onEmojiClick={onEmojiClick}
                            theme={typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                            width={320}
                            height={400}
                          />
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={submitting || !input.trim()}
                      className="p-2.5 rounded-xl text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: theme.buttons.primary.background,
                        boxShadow: theme.buttons.primary.shadow,
                      }}
                      title="Send message (Enter)"
                    >
                      {submitting ? (
                        <div
                          className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"
                        />
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <HomeFooter />
    </div>
  )
}
