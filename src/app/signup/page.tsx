import Link from 'next/link'
import { SignupForm } from '@/components/auth/SignupForm'
import { theme } from '@/lib/theme'

export default function SignupPage() {
  return (
    <div
      className="page-shell min-h-screen relative overflow-hidden flex flex-col"
      style={{
        background: `radial-gradient(circle at 50% 0%, ${theme.colors.frost100} 0%, ${theme.colors.snowWhite} 100%)`,
        color: theme.colors.textPrimary,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* --- Dynamic Snowflakes / Particles --- */}


      {/* Generate some snowflakes */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="snowflake"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            animationDuration: `${Math.random() * 10 + 10}s`,
            animationDelay: `${Math.random() * 5}s`,
            boxShadow: `0 0 5px ${theme.colors.frost200}`,
          }}
        />
      ))}

      {/* --- Atmospheric Glows --- */}
      <div
        className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full pointer-events-none opacity-60 mix-blend-multiply"
        style={{
          background: `radial-gradient(circle, ${theme.colors.frost200} 0%, transparent 70%)`,
          filter: 'blur(120px)',
          transform: 'translate(30%, -30%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none opacity-40 mix-blend-multiply"
        style={{
          background: `radial-gradient(circle, ${theme.colors.frost300} 0%, transparent 70%)`,
          filter: 'blur(100px)',
          transform: 'translate(-20%, 20%)',
        }}
      />

      <main className="content-wrap flex-grow flex items-center justify-center py-10 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid gap-8 lg:gap-16 lg:grid-cols-2 items-center w-full">

          {/* Left Side: Branding & Value Prop */}
          <section className="hidden lg:block space-y-8 animate-in fade-in slide-in-from-left-10 duration-700">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
                style={{
                  background: "rgba(0, 122, 255, 0.1)",
                  color: theme.colors.glacier600,
                  border: "1px solid rgba(0, 122, 255, 0.2)"
                }}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                New Platform
              </div>

              <h1
                className="text-5xl xl:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]"
                style={{
                  color: theme.colors.textPrimary,
                }}
              >
                Find your <br />
                <span className="text-transparent bg-clip-text"
                  style={{ backgroundImage: `linear-gradient(135deg, ${theme.colors.glacier500}, ${theme.colors.frost400})` }}
                >
                  Dream Home
                </span>
                <br /> this Winter
              </h1>

              <p className="text-lg leading-relaxed max-w-lg" style={{ color: theme.colors.textSecondary }}>
                Join the most aesthetic property platform. Connect with top-tier agents,
                schedule viewings, and manage your portfolio with crystal clear insights.
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-4 p-4 rounded-2xl transition-transform hover:translate-x-2"
                style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.8)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm" style={{ background: "white" }}>❄️</div>
                <div>
                  <h3 className="font-semibold" style={{ color: theme.colors.textPrimary }}>Curated Collections</h3>
                  <p className="text-sm" style={{ color: theme.colors.textMuted }}>Hand-picked properties for the season.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl transition-transform hover:translate-x-2"
                style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.8)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm" style={{ background: "white" }}>💎</div>
                <div>
                  <h3 className="font-semibold" style={{ color: theme.colors.textPrimary }}>Premium Insights</h3>
                  <p className="text-sm" style={{ color: theme.colors.textMuted }}>AI-driven valuation and market trends.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                style={{ color: theme.colors.glacier600 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Back to homepage
              </Link>
            </div>
          </section>

          {/* Right Side: Signup Form */}
          <div className="flex justify-center lg:justify-end animate-in fade-in slide-in-from-bottom-10 duration-700 delay-100">
            <SignupForm />
          </div>
        </div>
      </main>

      {/* Footer / Copyright */}
      <footer className="w-full py-6 text-center text-xs relative z-10" style={{ color: theme.colors.textMuted }}>
        &copy; {new Date().getFullYear()} EstatePro. Crafted with ❄️ by Taakra.
      </footer>
    </div>
  )
}
