import Link from 'next/link'

const footerColumns = [
  {
    title: 'Platform',
    links: [
      { href: '/competitions', label: 'Browse Competitions' },
      { href: '/meeting', label: 'Video Meetings' },
      { href: '/chat', label: 'Community' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '#about', label: 'About Taakra' },
      { href: '#services', label: 'Services' },
      { href: '/send-email', label: 'Support Contact' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/signup', label: 'Create Account' },
      { href: '/login', label: 'Sign In' },
      { href: '/profile', label: 'Profile' },
    ],
  },
]

export function HomeFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[color:var(--surface)] py-14">
      <div className="content-wrap">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_2fr]">
          <div className="max-w-md">
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[color:var(--surface-muted)] text-lg">
                ❄️
              </span>
              <div>
                <p className="text-base font-semibold tracking-tight">Taakra</p>
                <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  Snowy Competition Platform
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-[color:var(--muted)]">
              Transform competition discovery into a snowstorm of opportunities.
              Each competition is a unique snowflake waiting for you.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="mb-3 text-sm font-semibold text-[color:var(--foreground)]">
                  {column.title}
                </h3>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-[color:var(--muted)] transition-colors hover:text-[color:var(--foreground)]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="divider mt-10" />
        <div className="mt-5 flex flex-col gap-2 text-xs text-[color:var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Taakra. All rights reserved.</p>
          <p>Built for discovering competitions in a snowstorm of opportunities.</p>
        </div>
      </div>
    </footer>
  )
}
