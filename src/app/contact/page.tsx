import Image from 'next/image'
import Link from 'next/link'
import { theme } from '@/lib/theme'
import { Snowfall } from '@/components/ui/Snowfall'
import { HomeFooter } from '@/components/home/HomeFooter'
import { ContactForm } from '@/components/contact/ContactForm'
import { ContactFAQ } from '@/components/contact/ContactFAQ'

const helpTopics = [
  {
    icon: '📋',
    title: 'Registration & payments',
    description: 'Help with signing up for competitions, payment issues, refunds, and confirmation emails. Include your competition name and transaction ID if applicable.',
  },
  {
    icon: '📅',
    title: 'Competition rules & deadlines',
    description: 'Questions about eligibility, rules, submission formats, or deadline extensions. We can connect you with competition organizers when needed.',
  },
  {
    icon: '🛠️',
    title: 'Technical support',
    description: 'Login issues, broken links, upload problems, or anything not working as expected. Describe the steps you took and any error messages you see.',
  },
  {
    icon: '🤝',
    title: 'Partnerships & events',
    description: 'Interested in listing your competition, sponsoring, or collaborating? Tell us about your organization and goals.',
  },
  {
    icon: '💡',
    title: 'Feedback & suggestions',
    description: 'Ideas to improve the platform, new features, or general feedback. We read every message and use it to make Taakra better.',
  },
]

const contactStats = [
  { value: '24–48h', label: 'Typical response time' },
  { value: '500+', label: 'Active competitions' },
  { value: '10K+', label: 'Participants helped' },
]

export default function ContactPage() {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: theme.colors.darkIce }}
    >
      <Snowfall />

      {/* Background glows */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 70% 10%, ${theme.colors.frost100}22 0%, transparent 45%),
            radial-gradient(circle at 20% 70%, ${theme.colors.frost300}14 0%, transparent 40%),
            radial-gradient(circle at 90% 80%, ${theme.colors.frost200}10 0%, transparent 35%)`,
        }}
      />

      <main className="relative z-10">
        {/* Hero + Mascot */}
        <section className="content-wrap pt-10 sm:pt-14 lg:pt-20 pb-12 sm:pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-12 lg:grid-cols-[1fr_340px] lg:gap-20 items-center">
              <div className="text-center lg:text-left order-2 lg:order-1">
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 backdrop-blur-xl"
                  style={{
                    background: theme.glass.background,
                    border: theme.glass.border,
                    boxShadow: theme.glass.shadow,
                  }}
                >
                  <span className="text-lg">❄️</span>
                  <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: theme.colors.textMuted }}
                  >
                    Support &amp; community
                  </span>
                </div>

                <h1
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-tight"
                  style={{
                    color: theme.colors.textPrimary,
                    textShadow: `0 0 40px ${theme.colors.frost300}40`,
                  }}
                >
                  Get in touch.
                  <br />
                  <span
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.frost300}, ${theme.colors.glacier500})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    We&apos;re here to help.
                  </span>
                </h1>

                <p
                  className="text-base sm:text-lg mb-6 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Whether you need help with registration, have a question about a competition, or want to partner with us — our team is ready to support you every step of the way.
                </p>
                <p
                  className="text-sm mb-8 max-w-xl mx-auto lg:mx-0"
                  style={{ color: theme.colors.textMuted }}
                >
                  For quick questions, try our <Link href="/chat" className="underline hover:no-underline" style={{ color: theme.colors.frost300 }}>Community chat</Link>. For anything that needs a detailed reply, use the form below.
                </p>

                {/* Stats row */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-6 sm:gap-10 mb-8">
                  {contactStats.map(({ value, label }) => (
                    <div key={label} className="text-center lg:text-left">
                      <p
                        className="text-2xl sm:text-3xl font-bold tabular-nums"
                        style={{ color: theme.colors.frost300 }}
                      >
                        {value}
                      </p>
                      <p
                        className="text-xs uppercase tracking-wider mt-0.5"
                        style={{ color: theme.colors.textMuted }}
                      >
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <Link
                    href="/competitions"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-white transition-all duration-300 hover:scale-105"
                    style={{
                      background: theme.buttons.primary.background,
                      borderRadius: theme.radius.lg,
                      boxShadow: theme.glow.strong,
                    }}
                  >
                    Browse competitions ❄️
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-semibold transition-all duration-300 hover:scale-105"
                    style={{
                      background: theme.buttons.ghost.background,
                      border: theme.buttons.ghost.border,
                      color: theme.buttons.ghost.color,
                      borderRadius: theme.radius.lg,
                    }}
                  >
                    Create account
                  </Link>
                </div>
              </div>

              <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
                <div
                  className="relative w-56 h-56 sm:w-72 sm:h-72 lg:w-[340px] lg:h-[340px] rounded-3xl overflow-hidden flex-shrink-0 transition-transform duration-300 hover:scale-[1.02]"
                  style={{
                    background: theme.glass.background,
                    border: theme.glass.border,
                    boxShadow: theme.glass.shadow,
                    borderRadius: theme.radius.xl,
                  }}
                >
                  <Image
                    src="/mascot.jpeg"
                    alt="Taakra mascot – join the competition"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 288px, 340px"
                    priority
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 py-3 px-4 text-center text-sm font-semibold"
                    style={{
                      background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.75) 100%)',
                      color: theme.colors.textInverse,
                    }}
                  >
                    Ready to compete? 🏆
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What we help with */}
        <section className="content-wrap py-12 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-2xl sm:text-3xl font-bold text-center mb-3"
              style={{ color: theme.colors.textPrimary }}
            >
              What we can help with
            </h2>
            <p
              className="text-center max-w-2xl mx-auto mb-10 text-sm sm:text-base"
              style={{ color: theme.colors.textMuted }}
            >
              Choose the topic that best fits your request so we can route your message to the right team and get you a faster answer.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {helpTopics.map((topic) => (
                <div
                  key={topic.title}
                  className="p-5 sm:p-6 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: theme.glass.background,
                    border: theme.glass.border,
                    boxShadow: theme.glass.shadow,
                    borderRadius: theme.radius.lg,
                  }}
                >
                  <span className="text-3xl mb-3 block" aria-hidden>{topic.icon}</span>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    {topic.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: theme.colors.textMuted }}
                  >
                    {topic.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Form + sidebar (FAQ + tips) */}
        <section className="content-wrap pb-16 lg:pb-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14 items-start">
              {/* Form card */}
              <div
                className="p-6 sm:p-8 lg:p-10 rounded-3xl backdrop-blur-xl order-2 lg:order-1"
                style={{
                  background: theme.glass.background,
                  border: theme.glass.border,
                  boxShadow: theme.glass.shadow,
                  borderRadius: theme.radius.xl,
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">✉️</span>
                  <h2
                    className="text-2xl sm:text-3xl font-bold"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    Send us a message
                  </h2>
                </div>
                <p
                  className="text-sm mb-2"
                  style={{ color: theme.colors.textMuted }}
                >
                  Fill in the form below and we&apos;ll get back to you within 24–48 hours (business days). For urgent competition deadlines, mention the competition name and deadline in your message.
                </p>
                <p
                  className="text-xs mb-8"
                  style={{ color: theme.colors.textMuted }}
                >
                  All fields marked with <span style={{ color: theme.colors.danger }}>*</span> are required.
                </p>
                <ContactForm />
              </div>

              {/* Sidebar: Before you write + FAQ */}
              <div className="space-y-8 order-1 lg:order-2">
                <div
                  className="p-6 rounded-2xl backdrop-blur-xl"
                  style={{
                    background: theme.glass.background,
                    border: theme.glass.border,
                    boxShadow: theme.glass.shadow,
                    borderRadius: theme.radius.lg,
                  }}
                >
                  <h3
                    className="text-lg font-semibold mb-4 flex items-center gap-2"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    <span aria-hidden>📌</span>
                    Before you write
                  </h3>
                  <ul className="space-y-3 text-sm" style={{ color: theme.colors.textSecondary }}>
                    <li className="flex gap-2">
                      <span style={{ color: theme.colors.frost300 }}>•</span>
                      Include your <strong style={{ color: theme.colors.textPrimary }}>competition name or ID</strong> if your question is about a specific event.
                    </li>
                    <li className="flex gap-2">
                      <span style={{ color: theme.colors.frost300 }}>•</span>
                      For payment issues, add your <strong style={{ color: theme.colors.textPrimary }}>transaction or receipt ID</strong> so we can look it up.
                    </li>
                    <li className="flex gap-2">
                      <span style={{ color: theme.colors.frost300 }}>•</span>
                      Check the <Link href="/chat" className="underline hover:no-underline" style={{ color: theme.colors.frost300 }}>Community chat</Link> — many questions are answered there in real time.
                    </li>
                  </ul>
                </div>

                <ContactFAQ />
              </div>
            </div>

            {/* Quick links */}
            <div className="mt-12 flex flex-wrap justify-center gap-4 text-sm">
              <Link
                href="/competitions"
                className="px-5 py-2.5 rounded-xl font-medium transition-all hover:opacity-90"
                style={{
                  background: theme.glass.background,
                  border: theme.glass.border,
                  color: theme.colors.textSecondary,
                }}
              >
                Competitions
              </Link>
              <Link
                href="/chat"
                className="px-5 py-2.5 rounded-xl font-medium transition-all hover:opacity-90"
                style={{
                  background: theme.glass.background,
                  border: theme.glass.border,
                  color: theme.colors.textSecondary,
                }}
              >
                Community chat
              </Link>
              <Link
                href="/meeting"
                className="px-5 py-2.5 rounded-xl font-medium transition-all hover:opacity-90"
                style={{
                  background: theme.glass.background,
                  border: theme.glass.border,
                  color: theme.colors.textSecondary,
                }}
              >
                Meetings
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 rounded-xl font-medium transition-all hover:opacity-90"
                style={{
                  background: theme.glass.background,
                  border: theme.glass.border,
                  color: theme.colors.textSecondary,
                }}
              >
                Create account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <HomeFooter />
    </div>
  )
}
