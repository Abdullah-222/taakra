'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { HomeFooter } from '@/components/home/HomeFooter'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/components/ui/ToasterProvider'
import { theme } from '@/lib/theme'

type User = { id: number; email: string; name: string | null; role: string; imageUrl?: string | null }

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

type RegisteredCompetition = {
  id: number
  status: string
  paymentStatus: string
  createdAt: string
  competition: {
    id: number
    title: string
    description: string
    category: string
    deadline: string
    prize: string
    images: string[]
    status: string
  }
}

type TabType = 'profile' | 'notifications' | 'settings'

export default function ProfilePage() {
  const { user: authUser, loading: authLoading, checkAuth } = useAuth()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [registrations, setRegistrations] = useState<RegisteredCompetition[]>([])
  const [loadingRegistrations, setLoadingRegistrations] = useState(false)

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push('/login')
      return
    }
    if (authUser) {
      fetch('/api/auth/me')
        .then((r) => r.json())
        .then((data) => {
          setUser(data.user)
          setName(data.user?.name ?? '')
        })
        .catch(() => toast.error('Failed to load profile'))
        .finally(() => setLoading(false))
    }
  }, [authUser, authLoading, router])

  useEffect(() => {
    if (activeTab === 'notifications' && notifications.length === 0) {
      loadNotifications()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  useEffect(() => {
    if (!authUser) return
    setLoadingRegistrations(true)
    fetch('/api/registrations')
      .then((res) => res.json())
      .then((data) => setRegistrations(data.registrations ?? []))
      .catch(() => toast.error('Failed to load registrations'))
      .finally(() => setLoadingRegistrations(false))
  }, [authUser])

  async function loadNotifications() {
    setLoadingNotifications(true)
    try {
      const res = await fetch('/api/notifications?limit=50')
      const data = await res.json()
      if (res.ok) {
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      toast.error('Failed to load notifications')
    } finally {
      setLoadingNotifications(false)
    }
  }

  async function markAsRead(id: number) {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      })
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n
        )
      )
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  async function deleteNotification(id: number) {
    await markAsRead(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    toast.success('Notification removed')
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update')
      setUser(data.user)
      setName(data.user?.name ?? '')
      setEditing(false)
      toast.success('Profile updated')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.set('file', file)
      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setUser(data.user)
      checkAuth()
      toast.success('Profile photo updated')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload photo')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
        <main className="flex-1 flex items-center justify-center py-20">
          <div
            className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl"
            style={{
              background: theme.glass.background,
              border: theme.glass.border,
              boxShadow: theme.glass.shadow,
              color: theme.colors.textMuted,
            }}
          >
            <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Loading your profile...
          </div>
        </main>
        <HomeFooter />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const displayName = user.name?.trim() || user.email.split('@')[0] || 'User'
  const unreadCount = notifications.filter((n) => !n.readAt).length

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <main className="flex-1 w-full">
        {/* Hero */}
        <div
          className="relative overflow-hidden border-b"
          style={{
            borderColor: 'var(--glass-border)',
            background: 'linear-gradient(180deg, var(--color-frost-50) 0%, var(--background) 100%)',
          }}
        >
          <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 20% 50%, var(--color-frost-300) 0%, transparent 50%)' }} />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors hover:opacity-90"
              style={{ color: theme.colors.textMuted }}
            >
              ← Back to home
            </Link>
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-8 sm:gap-10">
              <div className="relative group shrink-0">
                <div
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden shadow-xl ring-4 ring-white/20 dark:ring-black/20"
                  style={{
                    boxShadow: theme.glass.shadow,
                    background: theme.glass.background,
                    border: theme.glass.border,
                  }}
                >
                  {user.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt={displayName}
                      width={144}
                      height={144}
                      className="w-full h-full object-cover"
                      unoptimized={user.imageUrl.includes('supabase')}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-4xl sm:text-5xl font-bold"
                      style={{
                        color: theme.colors.glacier500,
                        background: 'linear-gradient(135deg, var(--color-frost-100) 0%, var(--color-frost-200) 100%)',
                      }}
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <label
                  className="absolute inset-0 flex items-center justify-center rounded-3xl cursor-pointer transition-all opacity-0 group-hover:opacity-100"
                  style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                >
                  <span
                    className="text-white text-sm font-medium px-4 py-2 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.2)' }}
                  >
                    {uploading ? 'Uploading…' : 'Change photo'}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="sr-only"
                    disabled={uploading}
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h1
                  className="text-2xl sm:text-4xl font-bold tracking-tight"
                  style={{ color: theme.colors.textPrimary }}
                >
                  {displayName}
                </h1>
                <p className="mt-1 text-sm sm:text-base" style={{ color: theme.colors.textSecondary }}>
                  {user.email}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider"
                    style={{
                      background: 'color-mix(in srgb, var(--color-glacier-500) 18%, transparent)',
                      color: theme.colors.glacier500,
                      border: theme.glass.border,
                    }}
                  >
                    {user.role}
                  </span>
                  {registrations.length > 0 && (
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                      style={{ color: theme.colors.textSecondary, background: theme.glass.background, border: theme.glass.border }}
                    >
                      ❄️ {registrations.length} competition{registrations.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  {unreadCount > 0 && activeTab !== 'notifications' && (
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                      style={{ background: `${theme.colors.warning}22`, color: theme.colors.warning, border: `1px solid ${theme.colors.warning}` }}
                    >
                      {unreadCount} new notification{unreadCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {/* Tabs */}
          <nav
            className="flex gap-1 p-1.5 rounded-2xl mb-8 overflow-x-auto"
            style={{
              background: theme.glass.background,
              border: theme.glass.border,
              boxShadow: theme.glass.shadow,
            }}
            aria-label="Profile sections"
          >
            {[
              { id: 'profile' as TabType, label: 'Profile', icon: '👤' },
              { id: 'notifications' as TabType, label: 'Notifications', icon: '🔔', badge: unreadCount > 0 ? unreadCount : null },
              { id: 'settings' as TabType, label: 'Settings', icon: '⚙️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id ? 'text-white' : ''
                }`}
                style={
                  activeTab === tab.id
                    ? {
                        background: theme.buttons.primary.background,
                        boxShadow: theme.buttons.primary.shadow,
                      }
                    : { color: theme.colors.textSecondary }
                }
              >
                <span aria-hidden>{tab.icon}</span>
                {tab.label}
                {tab.badge != null && (
                  <span
                    className="min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: 'rgba(255,255,255,0.3)', color: 'inherit' }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <section
              className="rounded-2xl overflow-hidden"
              style={{
                background: theme.glass.background,
                border: theme.glass.border,
                boxShadow: theme.glass.shadow,
              }}
            >
              <div
                className="p-6 sm:p-8 border-b"
                style={{ borderColor: 'var(--glass-border)' }}
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl" aria-hidden>👤</span>
                  <h2 className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
                    Account details
                  </h2>
                </div>
                <p className="text-sm" style={{ color: theme.colors.textMuted }}>
                  Your display name and email. Only you can see this.
                </p>
              </div>
              <div className="p-6 sm:p-8">
                {editing ? (
                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.textPrimary }}>
                        Display name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none"
                        style={{
                          background: 'var(--input-bg)',
                          border: 'var(--input-border)',
                          color: 'var(--input-text)',
                        }}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all hover:scale-[1.02]"
                        style={{
                          background: theme.buttons.primary.background,
                          boxShadow: theme.buttons.primary.shadow,
                        }}
                      >
                        {saving ? 'Saving...' : 'Save changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false)
                          setName(user.name ?? '')
                        }}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                        style={{
                          background: theme.glass.background,
                          border: theme.glass.border,
                          color: theme.colors.textPrimary,
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 min-w-0">
                      <div
                        className="p-4 rounded-xl"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: theme.glass.border,
                        }}
                      >
                        <dt className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: theme.colors.textMuted }}>
                          Name
                        </dt>
                        <dd className="font-semibold text-lg" style={{ color: theme.colors.textPrimary }}>
                          {displayName}
                        </dd>
                      </div>
                      <div
                        className="p-4 rounded-xl"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: theme.glass.border,
                        }}
                      >
                        <dt className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: theme.colors.textMuted }}>
                          Email
                        </dt>
                        <dd className="font-medium truncate" style={{ color: theme.colors.textPrimary }}>
                          {user.email}
                        </dd>
                      </div>
                    </dl>
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shrink-0 transition-all hover:scale-[1.02]"
                      style={{
                        background: theme.buttons.primary.background,
                        color: theme.buttons.primary.color,
                        boxShadow: theme.buttons.primary.shadow,
                      }}
                    >
                      ✏️ Edit profile
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Registered Competitions - always visible when on profile tab */}
          {activeTab === 'profile' && (
            <section className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: theme.colors.textPrimary }}>
                    <span className="text-2xl" aria-hidden>❄️</span>
                    Your competition snowflakes
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: theme.colors.textMuted }}>
                    Competitions you&apos;ve registered for — track status and deadlines
                  </p>
                </div>
                {registrations.length > 0 && (
                  <Link
                    href="/registrations"
                    className="text-sm font-semibold px-3 py-2 rounded-xl transition-all hover:scale-[1.02]"
                    style={{
                      color: theme.colors.glacier500,
                      background: 'color-mix(in srgb, var(--color-glacier-500) 12%, transparent)',
                      border: theme.glass.border,
                    }}
                  >
                    View all →
                  </Link>
                )}
              </div>

              {loadingRegistrations ? (
                <div
                  className="rounded-2xl p-12 text-center"
                  style={{
                    background: theme.glass.background,
                    border: theme.glass.border,
                    boxShadow: theme.glass.shadow,
                    color: theme.colors.textMuted,
                  }}
                >
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent mx-auto" aria-hidden />
                  <p className="mt-3 text-sm">Loading your competitions...</p>
                </div>
              ) : registrations.length === 0 ? (
                <div
                  className="rounded-2xl p-10 text-center"
                  style={{
                    background: theme.glass.background,
                    border: theme.glass.border,
                    boxShadow: theme.glass.shadow,
                  }}
                >
                  <span className="text-5xl block mb-3">🏔️</span>
                  <p className="font-medium" style={{ color: theme.colors.textPrimary }}>No registrations yet</p>
                  <p className="text-sm mt-1" style={{ color: theme.colors.textMuted }}>Register for competitions to see them here</p>
                  <Link
                    href="/competitions"
                    className="inline-block mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-lg"
                    style={{
                      background: theme.buttons.primary.background,
                      boxShadow: theme.buttons.primary.shadow,
                    }}
                  >
                    Browse competitions
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {registrations.map((reg) => {
                    const comp = reg.competition
                    const deadline = new Date(comp.deadline)
                    const now = new Date()
                    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                    const isExpired = daysLeft < 0
                    const deadlineLabel = isExpired
                      ? 'Ended'
                      : daysLeft === 0
                        ? 'Today'
                        : daysLeft === 1
                          ? 'Tomorrow'
                          : `${daysLeft} days left`
                    const img = comp.images?.[0]
                    const regStatus = (reg.status || 'pending').toLowerCase()
                    const payStatus = (reg.paymentStatus || 'pending').toLowerCase()
                    const registrationLabel =
                      regStatus === 'approved'
                        ? 'Approved'
                        : regStatus === 'rejected'
                          ? 'Rejected by admin'
                          : 'Pending'
                    const paymentLabel =
                      payStatus === 'approved'
                        ? 'Payment approved'
                        : payStatus === 'rejected'
                          ? 'Payment rejected'
                          : 'Payment pending'
                    const registrationColor =
                      regStatus === 'approved'
                        ? theme.colors.success
                        : regStatus === 'rejected'
                          ? theme.colors.danger
                          : theme.colors.warning
                    const paymentColor =
                      payStatus === 'approved'
                        ? theme.colors.success
                        : payStatus === 'rejected'
                          ? theme.colors.danger
                          : theme.colors.warning
                    return (
                      <Link
                        key={reg.id}
                        href={`/competitions/${comp.id}`}
                        className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-glacier-500)]"
                        style={{
                          background: theme.glass.background,
                          border: theme.glass.border,
                          boxShadow: theme.glass.shadow,
                        }}
                      >
                        <div className="relative h-36 overflow-hidden">
                          {img ? (
                            <Image
                              src={img}
                              alt=""
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center text-4xl"
                              style={{ background: 'var(--color-frost-100)' }}
                            >
                              ❄️
                            </div>
                          )}
                          <div
                            className="absolute inset-0 opacity-70"
                            style={{
                              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)',
                            }}
                          />
                          <div className="absolute bottom-2 left-2 right-2 flex flex-wrap items-center gap-1.5">
                            <span
                              className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-lg text-white"
                              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
                            >
                              {comp.category}
                            </span>
                            <span
                              className="text-[10px] font-medium px-2 py-1 rounded-lg shrink-0 text-white"
                              style={{ background: registrationColor }}
                              title="Registration status"
                            >
                              {registrationLabel}
                            </span>
                            <span
                              className="text-[10px] font-medium px-2 py-1 rounded-lg shrink-0 text-white"
                              style={{ background: paymentColor }}
                              title="Payment status"
                            >
                              {paymentLabel}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold line-clamp-2 transition-colors" style={{ color: theme.colors.textPrimary }}>
                            {comp.title}
                          </h3>
                          <p className="text-xs mt-1 line-clamp-1" style={{ color: theme.colors.textMuted }}>
                            {comp.prize}
                          </p>
                          <p
                            className="text-xs font-medium mt-2"
                            style={{
                              color: isExpired ? theme.colors.textMuted : theme.colors.glacier500,
                            }}
                          >
                            {deadlineLabel}
                            {!isExpired && <span className="font-normal opacity-80"> · {deadline.toLocaleDateString()}</span>}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </section>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <section
              className="rounded-2xl overflow-hidden"
              style={{
                background: theme.glass.background,
                border: theme.glass.border,
                boxShadow: theme.glass.shadow,
              }}
            >
              <div
                className="p-6 sm:p-8 border-b"
                style={{ borderColor: 'var(--glass-border)' }}
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl" aria-hidden>🔔</span>
                  <h2 className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
                    All notifications
                  </h2>
                </div>
                <p className="text-sm mt-0.5" style={{ color: theme.colors.textMuted }}>
                  View and manage your notification history
                </p>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--glass-border)' }}>
                {loadingNotifications ? (
                  <div className="p-10 text-center" style={{ color: theme.colors.textMuted }}>
                    <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                    <p className="mt-3 text-sm">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-10 text-center">
                    <span className="text-5xl block mb-3" aria-hidden>🔔</span>
                    <p className="font-medium" style={{ color: theme.colors.textPrimary }}>No notifications yet</p>
                    <p className="text-sm mt-1" style={{ color: theme.colors.textMuted }}>
                      When you receive notifications, they&apos;ll appear here
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 sm:p-5 transition-colors hover:opacity-95"
                      style={{
                        background: !notification.readAt
                          ? 'color-mix(in srgb, var(--color-glacier-500) 8%, transparent)'
                          : 'transparent',
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                              {notification.title}
                            </h3>
                            {!notification.readAt && (
                              <span
                                className="inline-flex h-2 w-2 rounded-full shrink-0"
                                style={{ background: theme.colors.glacier500 }}
                                aria-hidden
                              />
                            )}
                            {notification.type && (
                              <span
                                className="text-xs px-2.5 py-1 rounded-lg capitalize font-medium"
                                style={{
                                  background: theme.glass.background,
                                  border: theme.glass.border,
                                  color: theme.colors.textSecondary,
                                }}
                              >
                                {notification.type.replace(/_/g, ' ')}
                              </span>
                            )}
                          </div>
                          <p className="mt-1.5 text-sm" style={{ color: theme.colors.textSecondary }}>
                            {notification.message}
                          </p>
                          <p className="mt-2 text-xs" style={{ color: theme.colors.textMuted }}>
                            {new Date(notification.createdAt).toLocaleString('en-US', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {!notification.readAt && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90"
                              style={{ color: theme.colors.glacier500, background: 'color-mix(in srgb, var(--color-glacier-500) 15%, transparent)' }}
                              title="Mark as read"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90"
                            style={{ color: theme.colors.danger }}
                            title="Delete notification"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <section
              className="rounded-2xl overflow-hidden"
              style={{
                background: theme.glass.background,
                border: theme.glass.border,
                boxShadow: theme.glass.shadow,
              }}
            >
              <div
                className="p-6 sm:p-8 border-b"
                style={{ borderColor: 'var(--glass-border)' }}
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl" aria-hidden>⚙️</span>
                  <h2 className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
                    Settings
                  </h2>
                </div>
                <p className="text-sm mt-0.5" style={{ color: theme.colors.textMuted }}>
                  Preferences and account security
                </p>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--glass-border)' }}>
                {[
                  { title: 'Notifications', desc: 'Email and push', icon: '🔔' },
                  { title: 'Privacy', desc: 'Profile visibility', icon: '👁️' },
                  { title: 'Security', desc: 'Password & 2FA', icon: '🔒' },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between p-4 sm:p-5 gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl shrink-0" aria-hidden>{item.icon}</span>
                      <div>
                        <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                          {item.title}
                        </p>
                        <p className="text-sm mt-0.5" style={{ color: theme.colors.textMuted }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-xs font-medium px-3 py-1.5 rounded-xl shrink-0"
                      style={{
                        background: theme.glass.background,
                        border: theme.glass.border,
                        color: theme.colors.textMuted,
                      }}
                    >
                      Coming soon
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="mt-10 flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
              style={{
                background: theme.glass.background,
                border: theme.glass.border,
                color: theme.colors.textSecondary,
              }}
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  )
}
