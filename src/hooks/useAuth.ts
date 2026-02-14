'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface User {
  id: number
  email: string
  name?: string | null
  role?: string
  imageUrl?: string | null
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (response.ok && data.user) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth, pathname])

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return { user, loading, logout, checkAuth }
}

