'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from 'next-themes'
import { createPusherClient } from '@/lib/pusher/client'
import { theme } from '@/lib/theme'

type NotificationItem = {
  id: number
  title: string
  message: string
  type?: string | null
  entityType?: string | null
  entityId?: number | null
  userId?: number | null
  readAt?: string | null
  createdAt: string
}

export function UserNotificationsBell({ userId }: { userId: number }) {
  const { theme: currentTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
  const [mounted, setMounted] = useState(false)

  const unreadLabel = useMemo(() => {
    if (unreadCount <= 0) return '0'
    return unreadCount > 99 ? '99+' : String(unreadCount)
  }, [unreadCount])

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/notifications')
      const data = await response.json()
      if (response.ok) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount ?? 0)
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  useEffect(() => {
    try {
      const pusher = createPusherClient()
      if (!pusher) return

      const channel = pusher.subscribe(`user-notifications-${userId}`)
      channel.bind('new-notification', (payload: { notification: NotificationItem }) => {
        if (!payload?.notification) return
        setNotifications((prev) => [payload.notification, ...prev].slice(0, 20))
        setUnreadCount((prev) => prev + 1)
      })

      return () => {
        channel.unbind_all()
        channel.unsubscribe()
        pusher.disconnect()
      }
    } catch {
      // Pusher not configured or subscription failed – bell still works without real-time
    }
  }, [userId])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const updatePosition = () => {
      if (buttonRef.current && open) {
        const rect = buttonRef.current.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          right: window.innerWidth - rect.right,
        })
      }
    }

    if (open) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open])

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', handler)
    }
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const markAllRead = async () => {
    if (unreadCount === 0) return
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      setUnreadCount(0)
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
      )
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
    }
  }

  const handleToggle = async () => {
    const nextOpen = !open
    setOpen(nextOpen)
    if (nextOpen) {
      await loadNotifications()
      await markAllRead()
    }
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          color: theme.colors.textSecondary,
          background: 'transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = currentTheme === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.05)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
        }}
        aria-label="Notifications"
      >
        <svg
          className="h-5 w-5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0h6z"
          />
        </svg>
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white min-w-[18px] text-center animate-pulse"
            style={{
              background: theme.colors.success,
              boxShadow: `0 0 10px ${theme.colors.success}40`,
            }}
          >
            {unreadLabel}
          </span>
        )}
      </button>

      {mounted && open && createPortal(
        <div
          ref={dropdownRef}
          className="fixed w-80 overflow-hidden rounded-xl z-[9999] animate-in fade-in slide-in-from-top-2 duration-300"
          style={{
            top: `${dropdownPosition.top}px`,
            right: `${dropdownPosition.right}px`,
            background: theme.glass.background,
            backdropFilter: theme.glass.blur,
            border: theme.glass.border,
            boxShadow: theme.glass.shadow,
          }}
        >
          <div 
            className="flex items-center justify-between px-4 py-3"
            style={{
              borderBottom: theme.glass.border,
            }}
          >
            <span 
              className="text-sm font-semibold"
              style={{ color: theme.colors.textPrimary }}
            >
              Notifications
            </span>
            {loading && (
              <span style={{ color: theme.colors.textMuted }} className="text-xs">Loading...</span>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && !loading && (
              <div 
                className="px-4 py-8 text-center text-sm"
                style={{ color: theme.colors.textMuted }}
              >
                No notifications yet.
              </div>
            )}
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="px-4 py-3 text-sm last:border-b-0 transition-all duration-200 cursor-pointer hover:scale-[1.01]"
                style={{
                  borderBottom: theme.glass.border,
                  background: !notification.readAt
                    ? currentTheme === 'dark'
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(16, 185, 129, 0.08)'
                    : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (notification.readAt) {
                    e.currentTarget.style.background = currentTheme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.02)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (notification.readAt) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <p 
                  className="font-medium"
                  style={{ color: theme.colors.textPrimary }}
                >
                  {notification.title}
                </p>
                <p 
                  className="mt-1 text-xs"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {notification.message}
                </p>
                <p 
                  className="mt-2 text-[11px]"
                  style={{ color: theme.colors.textMuted }}
                >
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
