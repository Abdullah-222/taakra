'use client'

import { useState } from 'react'
import { theme } from '@/lib/theme'
import Link from 'next/link'

const faqs = [
  {
    q: 'How do I register for a competition?',
    a: 'Go to the competition page, click "Register", and follow the steps. You may need to sign in or create an account first. Payment is handled securely via our checkout.',
  },
  {
    q: 'I missed the deadline. Can I still join?',
    a: 'Deadlines are set by competition organizers. Contact us with the competition name and we can forward your request to them — some allow late entries on a case-by-case basis.',
  },
  {
    q: 'How do I get a refund?',
    a: 'Refund policy depends on the competition. Send us your transaction ID and competition name; we\'ll check the rules and process eligible refunds or put you in touch with the organizer.',
  },
  {
    q: 'Who do I contact for urgent issues?',
    a: 'Use the form on this page and put "Urgent" in the subject. For technical issues during registration, include your email and the competition name so we can prioritize your ticket.',
  },
  {
    q: 'Can I list my own competition on Taakra?',
    a: 'Yes. Use the "Partnerships & events" topic in the form or reach out via the same form with details about your event. We\'ll get back to you with next steps.',
  },
]

export function ContactFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div
      className="p-4 sm:p-6 rounded-xl sm:rounded-2xl backdrop-blur-xl min-w-0"
      style={{
        background: theme.glass.background,
        border: theme.glass.border,
        boxShadow: theme.glass.shadow,
        borderRadius: theme.radius.lg,
      }}
    >
      <h3
        className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2"
        style={{ color: theme.colors.textPrimary }}
      >
        <span aria-hidden>❓</span>
        Common questions
      </h3>
      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="rounded-lg sm:rounded-xl overflow-hidden transition-colors min-w-0"
            style={{
              border: '1px solid var(--glass-border)',
              background: openIndex === index ? 'var(--color-frost-50)' : 'transparent',
            }}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full text-left px-3 sm:px-4 py-3 min-h-[48px] flex items-center justify-between gap-3 min-w-0"
              style={{ color: theme.colors.textPrimary }}
            >
              <span className="text-sm font-medium pr-2 min-w-0 break-words text-left">{faq.q}</span>
              <span
                className="shrink-0 text-lg leading-none transition-transform duration-200"
                style={{
                  color: theme.colors.textMuted,
                  transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                ▼
              </span>
            </button>
            {openIndex === index && (
              <div
                className="px-3 sm:px-4 pb-3 pt-0 text-xs sm:text-sm leading-relaxed border-t break-words"
                style={{
                  color: theme.colors.textSecondary,
                  borderColor: 'var(--glass-border)',
                }}
              >
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs" style={{ color: theme.colors.textMuted }}>
        Still stuck? <Link href="#contact-form" className="underline hover:no-underline" style={{ color: theme.colors.frost300 }}>Use the form</Link> and we&apos;ll help.
      </p>
    </div>
  )
}
