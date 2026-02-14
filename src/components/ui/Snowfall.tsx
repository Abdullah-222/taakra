'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

interface Snowflake {
  id: number
  left: number
  delay: number
  duration: number
  size: number
}

export function Snowfall() {
  const { theme: currentTheme } = useTheme()
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Generate 50 snowflakes
    const flakes: Snowflake[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10,
      size: 2 + Math.random() * 3,
    }))
    setSnowflakes(flakes)
  }, [])

  // Adjust opacity based on theme
  const snowflakeOpacity = currentTheme === 'dark' ? 0.6 : 0.3
  const snowflakeColor = currentTheme === 'dark' ? '#ffffff' : '#94a3b8'

  if (!mounted) return null

  return (
    <>
      <style jsx global>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: var(--snow-opacity);
          }
          90% {
            opacity: var(--snow-opacity);
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .snowflake {
          position: absolute;
          color: var(--snow-color);
          opacity: var(--snow-opacity);
          pointer-events: none;
          animation: snowfall linear infinite;
        }
      `}</style>
      <div 
        className="fixed inset-0 pointer-events-none overflow-hidden z-0"
        style={{
          ['--snow-opacity' as string]: `${snowflakeOpacity}`,
          ['--snow-color' as string]: snowflakeColor,
        }}
      >
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="snowflake"
            style={{
              left: `${flake.left}%`,
              animationDelay: `${flake.delay}s`,
              animationDuration: `${flake.duration}s`,
              fontSize: `${flake.size}px`,
            }}
          >
            ❄
          </div>
        ))}
      </div>
    </>
  )
}

