'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { HomeNav } from '@/components/home/HomeNav'
import { HomeFooter } from '@/components/home/HomeFooter'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/components/ui/ToasterProvider'
import { MessageThread, type Message, type Author } from '@/components/chat/MessageThread'
import { UserAvatar } from '@/components/chat/UserAvatar'

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
    } catch (err: any) {
      setMessages((prev) => removeOptimistic(prev, tempId))
      toast.error(err.message || 'Failed to send')
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
      <div className="min-h-screen bg-stone-50 dark:bg-gray-900 flex flex-col">
        <HomeNav />
        <main className="flex-1 flex items-center justify-center">
          <span className="text-stone-500">Loading...</span>
        </main>
        <HomeFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-50 to-emerald-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950/20 flex flex-col">
      <HomeNav />

      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-white tracking-tight">
                Community Chat
              </h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {messageCount} {messageCount === 1 ? 'message' : 'messages'}
                </span>
              </div>
            </div>
            <p className="text-stone-600 dark:text-gray-400 text-sm mt-1">
              Join the conversation. Reply to threads.
            </p>
          </div>
          {!user && (
            <Link
              href="/login"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold text-sm shadow-lg shadow-emerald-900/20 transition-all whitespace-nowrap"
            >
              Sign in
            </Link>
          )}
        </div>

        <div className="flex-1 flex flex-col min-h-0 rounded-2xl border border-stone-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl shadow-stone-900/10 overflow-hidden backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-stone-200 dark:border-gray-700 bg-gradient-to-r from-stone-50 to-emerald-50/50 dark:from-gray-900 dark:to-emerald-950/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <span className="text-sm font-semibold text-stone-800 dark:text-gray-200">
                Live Chat
              </span>
            </div>
            {!autoScroll && (
              <button
                type="button"
                onClick={scrollToBottom}
                className="px-2 py-1 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
              >
                ↓ New messages
              </button>
            )}
          </div>

          <div
            ref={feedRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-[320px] scroll-smooth"
          >
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-emerald-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-stone-700 dark:text-gray-300">
                      Loading chat...
                    </p>
                    <p className="text-xs text-stone-500 dark:text-gray-400 mt-1">
                      Fetching latest messages
                    </p>
                  </div>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 flex items-center justify-center text-4xl mb-5 shadow-lg">
                  💬
                </div>
                <p className="text-lg font-semibold text-stone-800 dark:text-gray-200">
                  No messages yet
                </p>
                <p className="text-sm text-stone-500 dark:text-gray-400 mt-2 max-w-xs">
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
            <div className="p-4 border-t border-stone-200 dark:border-gray-700 bg-gradient-to-r from-white to-stone-50/50 dark:from-gray-800 dark:to-gray-900/50">
              {replyingTo && (
                <div className="flex items-center gap-3 mb-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-800 shadow-sm">
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
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                        Replying to
                      </span>
                      <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-300 truncate">
                        {displayName(replyingTo.author)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-gray-400 truncate mt-0.5">
                      {replyingTo.content.slice(0, 60)}{replyingTo.content.length > 60 ? '…' : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-emerald-600 hover:text-emerald-800 hover:bg-emerald-200 dark:hover:text-emerald-300 dark:hover:bg-emerald-900/40 transition-all"
                    aria-label="Cancel reply"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <form onSubmit={handleSend} className="relative">
                <div className="flex gap-2 items-end rounded-2xl border-2 border-stone-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/20 dark:focus-within:ring-emerald-500/30 transition-all shadow-sm">
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
                    className="flex-1 min-h-[52px] max-h-32 resize-none bg-transparent px-4 py-3 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-gray-500 focus:outline-none text-sm rounded-2xl"
                  />
                  <div className="flex items-center gap-1 pr-2 pb-2">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowEmoji((e) => !e)}
                        className="p-2 rounded-xl text-stone-500 hover:text-stone-700 hover:bg-stone-200 dark:hover:text-gray-400 dark:hover:bg-gray-700 transition-colors"
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
                      className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-stone-300 disabled:to-stone-400 text-white shadow-lg shadow-emerald-900/25 transition-all active:scale-95"
                      title="Send message (Enter)"
                    >
                      {submitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
