'use client'

import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { theme } from '@/lib/theme'
import { X, Send, Loader2 } from 'lucide-react'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  cached?: boolean
}

export function TaakraChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Hi! I'm the **Taakra Snow Assistant** ❄️ — here to help with competitions, registration, and anything on the platform. What would you like to know?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const messageText = input.trim()
    setInput('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      })

      const data = await response.json()

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: data.reply,
            isUser: false,
            timestamp: new Date(),
            cached: data.cached,
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: data.reply || 'Sorry, I encountered an error.',
            isUser: false,
            timestamp: new Date(),
          },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: 'Sorry, I encountered an error. Please try again later.',
          isUser: false,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: theme.buttons.primary.background,
            boxShadow: theme.buttons.primary.shadow,
          }}
          aria-label="Open Taakra Assistant"
        >
          <span className="text-2xl">❄️</span>
        </button>
      )}

      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[420px] h-[520px] sm:h-[580px] rounded-2xl flex flex-col overflow-hidden"
          style={{
            background: theme.glass.background,
            border: theme.glass.border,
            boxShadow: theme.glass.shadow,
            backdropFilter: theme.glass.blur,
          }}
        >
          <div
            className="flex items-center justify-between shrink-0 px-4 py-3 border-b"
            style={{ borderColor: 'var(--glass-border)' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                style={{
                  background: theme.buttons.primary.background,
                  boxShadow: theme.buttons.primary.shadow,
                }}
              >
                ❄️
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold truncate" style={{ color: theme.colors.textPrimary }}>
                  Taakra Assistant
                </h3>
                <p className="text-xs truncate" style={{ color: theme.colors.textMuted }}>
                  Competitions & events
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl hover:opacity-80 transition-opacity shrink-0"
              style={{ color: theme.colors.textMuted }}
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[92%] rounded-2xl px-4 py-3 ${
                    message.isUser ? 'rounded-br-md' : 'rounded-bl-md'
                  }`}
                  style={{
                    background: message.isUser
                      ? theme.buttons.primary.background
                      : 'rgba(255,255,255,0.06)',
                    border: message.isUser ? 'none' : theme.glass.border,
                    color: message.isUser ? '#fff' : theme.colors.textPrimary,
                  }}
                >
                  {message.isUser ? (
                    <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                  ) : (
                    <div className="chat-markdown text-sm">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="my-1.5 first:mt-0 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="my-1.5 pl-4 list-disc space-y-0.5">{children}</ul>,
                          ol: ({ children }) => <ol className="my-1.5 pl-4 list-decimal space-y-0.5">{children}</ol>,
                          li: ({ children }) => <li className="my-0">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          code: ({ children }) => (
                            <code
                              className="px-1.5 py-0.5 rounded text-[0.8em] bg-black/15 dark:bg-white/15"
                              style={{ color: 'inherit' }}
                            >
                              {children}
                            </code>
                          ),
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline opacity-90 hover:opacity-100"
                              style={{ color: 'inherit' }}
                            >
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {message.cached && (
                      <span className="text-[10px] opacity-60">Cached</span>
                    )}
                    <span
                      className="text-[10px] opacity-60"
                      style={{ color: 'inherit' }}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div
                  className="rounded-2xl rounded-bl-md px-4 py-3"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: theme.glass.border,
                  }}
                >
                  <div className="flex gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ background: theme.colors.textMuted }}
                    />
                    <div
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{
                        background: theme.colors.textMuted,
                        animationDelay: '0.1s',
                      }}
                    />
                    <div
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{
                        background: theme.colors.textMuted,
                        animationDelay: '0.2s',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div
            className="shrink-0 p-3 pt-2 border-t"
            style={{ borderColor: 'var(--glass-border)' }}
          >
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about competitions, registration..."
                disabled={isTyping}
                rows={1}
                className="flex-1 min-h-[40px] max-h-24 py-2.5 px-4 rounded-xl text-sm resize-none outline-none transition-all"
                style={{
                  background: 'var(--input-bg)',
                  border: 'var(--input-border)',
                  color: 'var(--input-text)',
                }}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: theme.buttons.primary.background,
                  color: theme.buttons.primary.color,
                  boxShadow: theme.buttons.primary.shadow,
                }}
                aria-label="Send"
              >
                {isTyping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-[10px] mt-1.5 text-center" style={{ color: theme.colors.textMuted }}>
              Replies may include **markdown**. Shift+Enter for new line.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
