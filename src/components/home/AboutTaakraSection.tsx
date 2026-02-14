'use client'

import Link from 'next/link'
import { theme } from '../../../theme'

const features = [
  {
    icon: '❄️',
    title: 'Snowflake Discovery',
    description: 'Each competition is a unique snowflake. Discover opportunities tailored to your interests.',
  },
  {
    icon: '🤖',
    title: 'AI Recommendations',
    description: 'Get personalized competition suggestions based on your profile and history.',
  },
  {
    icon: '💬',
    title: 'Real-Time Chat',
    description: 'Connect with support staff and get instant answers to your questions.',
  },
  {
    icon: '🏆',
    title: 'Gamification',
    description: 'Earn Snow Points for registrations and achievements. Unlock badges as you progress.',
  },
  {
    icon: '📅',
    title: 'Calendar View',
    description: 'Plan your competitions with our intuitive calendar interface.',
  },
  {
    icon: '⚡',
    title: 'Trending Blizzards',
    description: 'See which competitions are creating a storm with high participation rates.',
  },
]

export function AboutTaakraSection() {
  return (
    <section 
      id="about" 
      className="py-16 sm:py-20 relative"
      style={{ background: theme.colors.darkIce }}
    >
      <div className="content-wrap">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ color: theme.colors.textPrimary }}
          >
            About Taakra ❄️
          </h2>
          <p
            className="text-base sm:text-lg leading-relaxed mb-6"
            style={{ color: theme.colors.textMuted }}
          >
            Taakra transforms competition discovery into a snowstorm of opportunities.
            Each competition is represented as a "snowflake" — unique and beautiful.
            Trending competitions behave like blizzards, deadlines melt away, and users earn Snow Points.
          </p>
          <p
            className="text-base leading-relaxed"
            style={{ color: theme.colors.textMuted }}
          >
            Our platform combines modern technology with an intuitive, snow-themed interface
            to make finding and participating in competitions a delightful experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2"
              style={{
                background: theme.glass.background,
                border: theme.glass.border,
                boxShadow: theme.glass.shadow,
                borderRadius: theme.radius.lg,
              }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: theme.colors.textPrimary }}
              >
                {feature.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: theme.colors.textMuted }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div
          className="max-w-3xl mx-auto p-8 sm:p-12 rounded-3xl text-center backdrop-blur-xl"
          style={{
            background: theme.glass.background,
            border: theme.glass.border,
            boxShadow: theme.glass.shadow,
            borderRadius: theme.radius.xl,
          }}
        >
          <h3
            className="text-2xl sm:text-3xl font-bold mb-4"
            style={{ color: theme.colors.textPrimary }}
          >
            Ready to Start Your Journey?
          </h3>
          <p
            className="text-base mb-6 max-w-2xl mx-auto"
            style={{ color: theme.colors.textMuted }}
          >
            Join thousands of users discovering and participating in competitions.
            Your next opportunity is just a snowflake away.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{
                background: theme.buttons.primary.background,
                borderRadius: theme.radius.md,
                boxShadow: theme.glow.strong,
              }}
            >
              Get Started Free
            </Link>
            <Link
              href="/competitions"
              className="px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              style={{
                background: theme.buttons.ghost.background,
                border: theme.buttons.ghost.border,
                color: theme.buttons.ghost.color,
                borderRadius: theme.radius.md,
              }}
            >
              Browse Competitions
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

