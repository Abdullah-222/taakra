'use client'

import { theme } from '../../../theme'

const metrics = [
  { value: '500+', label: 'Active Competitions', icon: '❄️' },
  { value: '10K+', label: 'Registered Users', icon: '👥' },
  { value: '$2.5M+', label: 'Total Prize Pool', icon: '🏆' },
  { value: '98%', label: 'Success Rate', icon: '⭐' },
]

export function StatsSection() {
  return (
    <section 
      className="py-16 sm:py-20 relative"
      style={{ background: theme.colors.darkIce }}
    >
      <div className="content-wrap">
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ color: theme.colors.textPrimary }}
          >
            Platform Statistics
          </h2>
          <p
            className="text-base sm:text-lg max-w-2xl mx-auto"
            style={{ color: theme.colors.textMuted }}
          >
            Join thousands of users discovering and participating in competitions
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="p-6 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2"
              style={{
                background: theme.glass.background,
                border: theme.glass.border,
                boxShadow: theme.glass.shadow,
                borderRadius: theme.radius.lg,
              }}
            >
              <div className="text-4xl mb-3">{metric.icon}</div>
              <p
                className="text-3xl font-bold mb-2"
                style={{ color: theme.colors.textPrimary }}
              >
                {metric.value}
              </p>
              <p
                className="text-sm uppercase tracking-wider"
                style={{ color: theme.colors.textMuted }}
              >
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
