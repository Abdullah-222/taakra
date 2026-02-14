import Link from 'next/link'
import { SendEmailForm } from '@/components/email/SendEmailForm'
import { HomeFooter } from '@/components/home/HomeFooter'
import { theme } from '@/lib/theme'

export default function SendEmailPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <main className="flex-1 w-full">
        <div
          className="relative border-b"
          style={{
            borderColor: 'var(--glass-border)',
            background: 'linear-gradient(180deg, var(--color-frost-50) 0%, var(--background) 100%)',
          }}
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-90"
              style={{ color: theme.colors.textMuted }}
            >
              ← Back to home
            </Link>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <SendEmailForm />
        </div>
      </main>
      <HomeFooter />
    </div>
  )
}
