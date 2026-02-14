'use client'

import { useState } from 'react'
import Image from 'next/image'

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

  const getBadgeColor = (userRole?: string | null) => {
    if (userRole === 'admin') return 'bg-gradient-to-br from-purple-500 to-purple-700'
    return 'bg-gradient-to-br from-emerald-500 to-emerald-700'
  }

  const getBadgeLabel = (userRole?: string | null) => {
    if (userRole === 'admin') return '👑'
    return null
  }

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
            className="rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={`${sizeClasses[size]} rounded-full ${getBadgeColor(role)} flex items-center justify-center text-white font-semibold ring-2 ring-white dark:ring-gray-800`}
          >
            {initial}
          </div>
        )}
        {getBadgeLabel(role) && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-[10px]">
            {getBadgeLabel(role)}
          </div>
        )}
      </div>

      {showTooltip && showTooltipState && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
          <div className="bg-gray-900 dark:bg-gray-700 text-white px-3 py-2 rounded-lg shadow-xl text-xs whitespace-nowrap">
            <div className="font-semibold">{displayName}</div>
            <div className="text-gray-300 dark:text-gray-400 text-[10px]">{email}</div>
            {role === 'admin' && (
              <div className="mt-1 text-purple-300 text-[10px] font-medium">Admin</div>
            )}
          </div>
          <div className="w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45 absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1" />
        </div>
      )}
    </div>
  )
}
