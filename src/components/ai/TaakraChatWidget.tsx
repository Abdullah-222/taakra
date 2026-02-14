'use client'

import { useState, useEffect, useRef } from 'react'
import { theme } from '../../../theme'
import { X, Send, MessageCircle, Loader2 } from 'lucide-react'

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
      text: "Hello! I'm ❄️ Taakra Snow Assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Focus input when chat opens
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
        headers: {
          'Content-Type': 'application/json',
        },
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
    } catch (error) {
      console.error('Error sending message:', error)
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          style={{
            background: theme.buttons.primary.background,
            boxShadow: `0 4px 20px ${theme.glow.ice}`,
          }}
          aria-label="Open Taakra Snow Assistant"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 w-96 h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{
            background: theme.glass.background,
            border: theme.glass.border,
            backdropFilter: theme.glass.blur,
            boxShadow: theme.glass.shadow,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 border-b"
            style={{ borderColor: theme.glass.border }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: theme.buttons.primary.background }}>
                <span className="text-white text-sm">❄️</span>
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                  Taakra Snow Assistant
                </h3>
                <p className="text-xs" style={{ color: theme.colors.textMuted }}>
                  Ready
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" style={{ color: theme.colors.textMuted }} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.isUser
                      ? 'rounded-br-sm'
                      : 'rounded-bl-sm'
                  }`}
                  style={{
                    background: message.isUser
                      ? theme.buttons.primary.background
                      : theme.glass.background,
                    border: message.isUser ? 'none' : theme.glass.border,
                    color: message.isUser ? '#fff' : theme.colors.textPrimary,
                  }}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  {message.cached && (
                    <p className="text-xs mt-1 opacity-60">Cached response</p>
                  )}
                  <p className="text-xs mt-1 opacity-60">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div
                  className="rounded-2xl rounded-bl-sm px-4 py-2"
                  style={{
                    background: theme.glass.background,
                    border: theme.glass.border,
                  }}
                >
                  <div className="flex gap-1">
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

          {/* Input */}
          <div
            className="p-4 border-t"
            style={{ borderColor: theme.glass.border }}
          >
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isTyping}
                className="flex-1 px-4 py-2 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: theme.inputs.background,
                  border: theme.inputs.border,
                  borderRadius: theme.inputs.radius,
                  color: theme.colors.textPrimary,
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: theme.buttons.primary.background,
                  color: theme.buttons.primary.color,
                }}
                aria-label="Send message"
              >
                {isTyping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: theme.colors.textMuted }}>
              Ask about competitions, registration, deadlines, and more
            </p>
          </div>
        </div>
      )}
    </>
  )
}
