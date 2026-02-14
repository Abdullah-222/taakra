'use client'

import { useState } from 'react'
import Image from 'next/image'
import { theme } from '@/lib/theme'

type UserAvatarProps = {
  userId: number
  name: string | null
  email: string
  imageUrl?: string | null
  role?: string | null
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

export function UserAvatar({
  name,
  email,
  imageUrl,
  role,
  size = 'md',
  showTooltip = true,
}: UserAvatarProps) {
  const [showTooltipState, setShowTooltipState] = useState(false)
  const [imgError, setImgError] = useState(false)

  const displayName = name?.trim() || email.split('@')[0] || 'Anonymous'
  const initial = displayName.charAt(0).toUpperCase()

  const isAdmin = role === 'admin'

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => showTooltip && setShowTooltipState(true)}
      onMouseLeave={() => showTooltip && setShowTooltipState(false)}
    >
      <div className={`relative ${sizeClasses[size]} shrink-0`}>
        {imageUrl && !imgError ? (
          <Image
            src={imageUrl}
            alt={displayName}
            width={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
            height={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
            className="rounded-full object-cover border-2"
            style={{ borderColor: 'var(--glass-border)' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-semibold border-2`}
            style={{
              background: isAdmin
                ? `linear-gradient(135deg, ${theme.colors.glacier600} 0%, ${theme.colors.glacier500} 100%)`
                : theme.buttons.primary.background,
              borderColor: 'var(--glass-border)',
            }}
          >
            {initial}
          </div>
        )}
        {isAdmin && (
          <div
            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px]"
            style={{
              background: theme.glass.background,
              border: theme.glass.border,
            }}
          >
            ❄️
          </div>
        )}
      </div>

      {showTooltip && showTooltipState && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
          <div
            className="px-3 py-2 rounded-lg shadow-xl text-xs whitespace-nowrap"
            style={{
              background: theme.colors.offWhite,
              border: theme.glass.border,
              color: theme.colors.textPrimary,
              boxShadow: theme.glass.shadow,
            }}
          >
            <div className="font-semibold">{displayName}</div>
            <div className="text-[10px]" style={{ color: theme.colors.textMuted }}>
              {email}
            </div>
            {isAdmin && (
              <div
                className="mt-1 text-[10px] font-medium"
                style={{ color: theme.colors.frost400 }}
              >
                Admin
              </div>
            )}
          </div>
          <div
            className="w-2 h-2 rotate-45 absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1"
            style={{
              background: theme.colors.offWhite,
              borderRight: theme.glass.border,
              borderBottom: theme.glass.border,
            }}
          />
        </div>
      )}
    </div>
  )
}
