'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { theme } from '@/lib/theme'

export function Navbar() {
    const { theme: currentTheme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    const toggleTheme = () => {
        setTheme(currentTheme === 'dark' ? 'light' : 'dark')
    }

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 mx-4 mt-4 rounded-2xl transition-all duration-300"
            style={{
                background: theme.glass.background,
                backdropFilter: theme.glass.blur,
                border: theme.glass.border,
                boxShadow: theme.glass.shadow,
            }}
        >
            {/* Logo Area */}
            <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-all">
                    ❄️
                </div>
                <span className="font-bold text-lg" style={{ color: theme.colors.textPrimary }}>
                    EstatePro
                </span>
            </Link>

            {/* Right Side: Links & Toggle */}
            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
                    <Link href="#" className="hover:text-blue-500 transition-colors">Buy</Link>
                    <Link href="#" className="hover:text-blue-500 transition-colors">Rent</Link>
                    <Link href="#" className="hover:text-blue-500 transition-colors">Sell</Link>
                </div>

                {/* Theme Toggle Button */}
                <button
                    onClick={toggleTheme}
                    className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:scale-110 active:scale-95 overflow-hidden"
                    style={{
                        background: 'rgba(125, 211, 252, 0.1)',
                        border: `1px solid ${theme.colors.frost200}`,
                        color: theme.colors.textPrimary
                    }}
                    aria-label="Toggle Theme"
                >
                    {mounted ? (
                        currentTheme === 'dark' ? (
                            <span className="text-yellow-300 text-lg animate-in fade-in zoom-in spin-in-90 duration-300">🌙</span>
                        ) : (
                            <span className="text-orange-400 text-lg animate-in fade-in zoom-in spin-in-90 duration-300">☀️</span>
                        )
                    ) : (
                        <span className="opacity-0">.</span>
                    )}
                </button>

                <Link href="/signup">
                    <button
                        className="px-5 py-2 rounded-xl text-sm font-bold shadow-lg transition-transform hover:-translate-y-0.5"
                        style={{
                            background: theme.buttons.primary.background,
                            color: theme.buttons.primary.color,
                        }}
                    >
                        Get Started
                    </button>
                </Link>
            </div>
        </nav>
    )
}
