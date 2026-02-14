'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { theme } from '../../../theme'

interface CreateCompetitionButtonProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function CreateCompetitionButton({ href, children, className = '' }: CreateCompetitionButtonProps) {
  const { theme: currentTheme } = useTheme()
  const glowEffect = currentTheme === 'dark' ? theme.glow.strong : '0 0 20px rgba(54, 158, 255, 0.2)'

  return (
    <Link
      href={href}
      className={`px-6 py-3 text-sm font-semibold transition-all duration-300 hover:scale-105 ${className}`}
      style={{
        background: 'var(--color-glacier-500)',
        color: '#ffffff',
        borderRadius: theme.buttons.primary.radius,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = glowEffect
        e.currentTarget.style.background = 'var(--color-glacier-600)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.background = 'var(--color-glacier-500)'
      }}
    >
      {children}
    </Link>
  )
}

