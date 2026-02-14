'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Snowfall } from '@/components/ui/Snowfall'
import { theme } from '../../../theme'

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <Snowfall />
      
      {/* Background gradient effects */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${theme.colors.frost100}15 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none opacity-20"
        style={{
          background: `radial-gradient(circle, ${theme.colors.frost300} 0%, transparent 70%)`,
          filter: 'blur(100px)',
          transform: 'translate(-20%, 20%)',
        }}
      />

      <div className="relative z-10 content-wrap py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 backdrop-blur-xl transition-all duration-300"
            style={{
              background: theme.glass.background,
              border: theme.glass.border,
              boxShadow: theme.glass.shadow,
            }}
          >
            <span className="text-xl">❄️</span>
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: theme.colors.textMuted }}
            >
              Snowy Competition Platform
            </span>
          </div>

          {/* Main Heading */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            style={{
              color: theme.colors.textPrimary,
              textShadow: `0 0 40px ${theme.colors.frost300}40`,
            }}
          >
            Discover Your Next
            <br />
            <span
              style={{
                background: `linear-gradient(135deg, ${theme.colors.frost300}, ${theme.colors.glacier500})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Competition
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ color: theme.colors.textMuted }}
          >
            Transform competition discovery into a snowstorm of opportunities. 
            Each competition is a unique snowflake. Find yours today.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Link
              href="/competitions"
              className="px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{
                background: theme.buttons.primary.background,
                borderRadius: theme.radius.lg,
                boxShadow: theme.glow.strong,
              }}
            >
              Browse Competitions ❄️
            </Link>
            <Link
              href="/signup"
              className="px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105"
              style={{
                background: theme.buttons.ghost.background,
                border: theme.buttons.ghost.border,
                color: theme.buttons.ghost.color,
                borderRadius: theme.radius.lg,
              }}
            >
              Get Started
            </Link>
          </div>

          {/* Search Bar */}
          <div
            className="max-w-2xl mx-auto p-6 rounded-2xl backdrop-blur-xl transition-all duration-300"
            style={{
              background: theme.glass.background,
              border: theme.glass.border,
              boxShadow: theme.glass.shadow,
              borderRadius: theme.radius.lg,
            }}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Search competitions, categories, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-5 py-3 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all"
                style={{
                  background: theme.inputs.background,
                  border: theme.inputs.border,
                  borderRadius: theme.inputs.radius,
                }}
                onFocus={(e) => {
                  e.target.style.border = `1px solid ${theme.colors.glacier500}`
                  e.target.style.boxShadow = `0 0 0 4px ${theme.colors.glacier500}40`
                }}
                onBlur={(e) => {
                  e.target.style.border = theme.inputs.border
                  e.target.style.boxShadow = 'none'
                }}
              />
              <Link
                href={`/competitions${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`}
                className="px-6 py-3 rounded-xl font-semibold text-white text-center transition-all duration-300 hover:scale-105"
                style={{
                  background: theme.buttons.primary.background,
                  borderRadius: theme.radius.md,
                }}
              >
                Search
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto">
            <StatChip label="Active Competitions" value="500+" />
            <StatChip label="Registered Users" value="10K+" />
            <StatChip label="Categories" value="9+" />
            <StatChip label="Success Rate" value="98%" />
          </div>
        </div>
      </div>
    </section>
  )
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="p-4 rounded-xl backdrop-blur-xl transition-all duration-300 hover:scale-105"
      style={{
        background: theme.glass.background,
        border: theme.glass.border,
        borderRadius: theme.radius.md,
      }}
    >
      <p
        className="text-2xl font-bold mb-1"
        style={{ color: theme.colors.textPrimary }}
      >
        {value}
      </p>
      <p
        className="text-xs uppercase tracking-wider"
        style={{ color: theme.colors.textMuted }}
      >
        {label}
      </p>
    </div>
  )
}

