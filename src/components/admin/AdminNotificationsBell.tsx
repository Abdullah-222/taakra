'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPusherClient } from '@/lib/pusher/client'

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

export function AdminNotificationsBell({ userId }: { userId?: number }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const unreadLabel = useMemo(() => {
    if (unreadCount <= 0) return '0'
    return unreadCount > 99 ? '99+' : String(unreadCount)
  }, [unreadCount])

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await fetch('/api/admin/notifications')
        const data = await response.json()
        if (response.ok) {
          setNotifications(data.notifications || [])
          setUnreadCount(data.unreadCount || 0)
        }
      } catch (error) {
        console.error('Failed to load notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [])

  useEffect(() => {
    const pusher = createPusherClient()
    if (!pusher) return

    const channel = pusher.subscribe('admin-notifications')
    channel.bind('new-notification', (payload: { notification: NotificationItem }) => {
      if (!payload?.notification) return
      if (userId && payload.notification.userId && payload.notification.userId !== userId) return
      setNotifications((prev) => [payload.notification, ...prev].slice(0, 20))
      setUnreadCount((prev) => prev + 1)
    })

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
      pusher.disconnect()
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
      await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      setUnreadCount(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })))
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
    }
  }

  const handleToggle = async () => {
    const nextOpen = !open
    setOpen(nextOpen)
    if (nextOpen) {
      await markAllRead()
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 shadow-sm transition hover:bg-stone-50 hover:text-stone-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        aria-label="Notifications"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0h6z"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {unreadLabel}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 text-sm font-semibold text-stone-700 dark:border-gray-700 dark:text-gray-200">
            <span>Notifications</span>
            {loading && <span className="text-xs text-stone-400">Loading...</span>}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && !loading && (
              <div className="px-4 py-6 text-sm text-stone-500 dark:text-gray-400">
                No notifications yet.
              </div>
            )}
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="border-b border-stone-100 px-4 py-3 text-sm last:border-b-0 dark:border-gray-700"
              >
                <p className="font-medium text-stone-800 dark:text-gray-100">{notification.title}</p>
                <p className="mt-1 text-xs text-stone-500 dark:text-gray-400">{notification.message}</p>
                <p className="mt-2 text-[11px] text-stone-400 dark:text-gray-500">
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
