'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

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
    const handler = (event: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
        type="button"
        onClick={handleToggle}
        className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors hover:opacity-90"
        style={{
          color: theme.colors.textPrimary,
          background: 'transparent',
          border: 'none',
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
            className="absolute -top-0.5 -right-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white min-w-[18px] text-center"
            style={{ background: theme.colors.glacier500 }}
          >
            {unreadLabel}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl shadow-xl z-[100]"
          style={{
            background: theme.glass.background,
            border: theme.glass.border,
            boxShadow: theme.glass.shadow,
            borderRadius: theme.radius.md,
          }}
        >
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{ borderColor: 'var(--glass-border)' }}
          >
            <span className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>
              Notifications
            </span>
            {loading && (
              <span className="text-xs" style={{ color: theme.colors.textMuted }}>
                Loading...
              </span>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && !loading && (
              <div className="px-4 py-8 text-center text-sm" style={{ color: theme.colors.textMuted }}>
                No notifications yet.
              </div>
            )}
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="border-b px-4 py-3 text-sm last:border-b-0 transition-colors cursor-pointer"
                style={{
                  borderColor: 'var(--glass-border)',
                  background: notification.readAt ? 'transparent' : 'var(--color-frost-50)',
                }}
              >
                <p className="font-medium" style={{ color: theme.colors.textPrimary }}>
                  {notification.title}
                </p>
                <p className="mt-1 text-xs" style={{ color: theme.colors.textSecondary }}>
                  {notification.message}
                </p>
                <p className="mt-2 text-[11px]" style={{ color: theme.colors.textMuted }}>
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
