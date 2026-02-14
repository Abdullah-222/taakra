'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { LoginForm } from '@/components/auth/LoginForm'
import { Snowfall } from '@/components/ui/Snowfall'
import { theme } from '../../../theme'

export default function LoginPage() {
  const { theme: currentTheme } = useTheme()

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--background)]">
      <Snowfall />
      
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          {/* Left Side - Welcome Section */}
          <div
            className="p-8 lg:p-10 rounded-3xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--glass-shadow)',
              borderRadius: theme.radius.xl,
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="text-4xl"
                style={{
                  filter: currentTheme === 'dark' ? `drop-shadow(${theme.glow.strong})` : 'none',
                }}
              >
                ❄️
              </div>
              <h1
                className="text-4xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Taakra
              </h1>
            </div>
            
            <p
              className="text-sm uppercase tracking-widest mb-4"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Welcome Back
            </p>
            
            <h2
              className="text-3xl font-semibold mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Step into the Snowstorm
            </h2>
            
            <p
              className="text-base leading-relaxed mb-8"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Discover competitions, earn Snow Points, and join a blizzard of opportunities. 
              Each competition is a unique snowflake waiting for you.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span style={{ color: 'var(--color-frost-300)' }}>❄</span>
                <p
                  className="text-sm flex-1"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Browse trending competitions like blizzards
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span style={{ color: 'var(--color-frost-300)' }}>❄</span>
                <p
                  className="text-sm flex-1"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Get AI-powered personalized recommendations
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span style={{ color: 'var(--color-frost-300)' }}>❄</span>
                <p
                  className="text-sm flex-1"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Earn Snow Points and unlock achievements
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="inline-block mt-8 px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid var(--glass-border)',
                color: 'var(--color-text-primary)',
                borderRadius: theme.radius.lg,
              }}
            >
              <span className="text-sm font-medium">Back to home</span>
            </Link>
          </div>

          {/* Right Side - Login Form */}
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
