'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { theme } from '@/lib/theme'
import { Send, Loader2 } from 'lucide-react'

type User = { id: number; email: string; name: string | null } | null

type Message = {
  id: string
  room_id: string
  content: string
  author_id: string | null
  created_at: string
  app_user_id?: string | null
  author_display_name?: string | null
}

type Props = {
  competitionId: number
  competitionTitle: string
  currentUser: User
}

export function CompetitionChat({ competitionId, competitionTitle, currentUser }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const slug = `competition-${competitionId}`

  // Get or create room, then load messages and subscribe
  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const { data: existing, error: selectRoomErr } = await supabase
          .from('rooms')
          .select('id')
          .eq('slug', slug)
          .maybeSingle()
        if (selectRoomErr) {
          console.error('[CompetitionChat] Room select failed:', selectRoomErr)
          setError(`Could not load room: ${selectRoomErr.message || selectRoomErr.code || 'Unknown'}`)
          setLoading(false)
          return
        }

        let rid: string
        if (existing?.id) {
          rid = existing.id
        } else {
          const { data: created, error: insertErr } = await supabase
            .from('rooms')
            .insert({ slug, name: competitionTitle })
            .select('id')
            .single()
          if (insertErr || !created?.id) {
            const msg = insertErr?.message || 'Unknown error'
            const details = insertErr?.details ? ` (${insertErr.details})` : ''
            const code = insertErr?.code ? ` [${insertErr.code}]` : ''
            console.error('[CompetitionChat] Room insert failed:', insertErr)
            setError(`Could not create chat room: ${msg}${details}${code}`)
            return
          }
          rid = created.id
        }

        if (!mounted) return
        setRoomId(rid)

        const { data: rows, error: fetchErr } = await supabase
          .from('messages')
          .select('id, room_id, content, author_id, created_at')
          .eq('room_id', rid)
          .order('created_at', { ascending: true })

        if (fetchErr) {
          const msg = fetchErr?.message || 'Unknown error'
          console.error('[CompetitionChat] Messages fetch failed:', fetchErr)
          setError(`Could not load messages: ${msg}`)
          return
        }
        if (mounted) setMessages(rows ?? [])

        const channel = supabase
          .channel(`room:${rid}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
            },
            (payload) => {
              const newRow = payload.new as Message
              if (newRow.room_id === rid && mounted) {
                setMessages((prev) => [...prev, newRow])
              }
            }
          )
          .subscribe()

        channelRef.current = channel
      } catch (e: any) {
        const msg = e?.message ?? String(e)
        console.error('[CompetitionChat] Init error:', e)
        if (mounted) setError(`Something went wrong: ${msg}`)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()
    return () => {
      mounted = false
      channelRef.current?.unsubscribe()
    }
  }, [slug, competitionTitle, competitionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || !roomId || sending) return
    if (!currentUser) {
      setError('Sign in to chat')
      return
    }

    setSending(true)
    setError(null)
    try {
      const { error: insertErr } = await supabase.from('messages').insert({
        room_id: roomId,
        content: text,
        author_id: null,
      })
      if (insertErr) throw insertErr
      setInput('')
    } catch (e: any) {
      const msg = e?.message || e?.error_description || String(e)
      console.error('[CompetitionChat] Send error:', e)
      setError(`Failed to send: ${msg}`)
    } finally {
      setSending(false)
    }
  }

  const displayName = (m: Message) =>
    m.author_display_name ?? m.app_user_id ?? (m.author_id ? `User ${m.author_id.slice(0, 8)}` : 'User')

  if (loading) {
    return (
      <div
        className="rounded-2xl p-6 flex items-center justify-center gap-2"
        style={{
          background: theme.glass.background,
          border: theme.glass.border,
          boxShadow: theme.glass.shadow,
        }}
      >
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: theme.colors.textMuted }} />
        <span className="text-sm" style={{ color: theme.colors.textMuted }}>Loading chat…</span>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: theme.glass.background,
        border: theme.glass.border,
        boxShadow: theme.glass.shadow,
      }}
    >
      <div
        className="px-4 py-3 border-b flex items-center gap-2"
        style={{ borderColor: 'var(--glass-border)' }}
      >
        <span className="text-lg">💬</span>
        <h3 className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>
          Live chat
        </h3>
      </div>

      <div className="flex-1 min-h-[240px] max-h-[320px] overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-sm text-center py-4" style={{ color: theme.colors.textMuted }}>
            No messages yet. Say hi!
          </p>
        )}
        {messages.map((m) => {
          const isMine = m.app_user_id != null && currentUser && m.app_user_id === String(currentUser.id)
          return (
          <div
            key={m.id}
            className={`flex flex-col max-w-[90%] ${isMine ? 'ml-auto items-end' : ''}`}
          >
            <span className="text-[10px] font-medium mb-0.5" style={{ color: theme.colors.textMuted }}>
              {displayName(m)}
            </span>
            <div
              className="rounded-xl px-3 py-2 text-sm"
              style={{
                background: isMine ? theme.buttons.primary.background : 'rgba(255,255,255,0.06)',
                border: isMine ? 'none' : theme.glass.border,
                color: isMine ? '#fff' : theme.colors.textPrimary,
              }}
            >
              {m.content}
            </div>
            <span className="text-[10px] mt-0.5" style={{ color: theme.colors.textMuted }}>
              {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <p className="px-3 py-1.5 text-xs" style={{ color: theme.colors.danger }}>
          {error}
        </p>
      )}

      {currentUser ? (
        <div
          className="p-3 border-t flex gap-2"
          style={{ borderColor: 'var(--glass-border)' }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message…"
            disabled={sending}
            className="flex-1 min-w-0 px-3 py-2 rounded-xl text-sm outline-none"
            style={{
              background: 'var(--input-bg)',
              border: 'var(--input-border)',
              color: 'var(--input-text)',
            }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-40"
            style={{
              background: theme.buttons.primary.background,
              color: theme.buttons.primary.color,
              boxShadow: theme.buttons.primary.shadow,
            }}
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      ) : (
        <div
          className="p-3 border-t text-center text-sm"
          style={{ borderColor: 'var(--glass-border)', color: theme.colors.textMuted }}
        >
          <a href="/login" className="underline" style={{ color: theme.colors.glacier500 }}>
            Sign in
          </a>
          {' '}to join the chat
        </div>
      )}
    </div>
  )
}
