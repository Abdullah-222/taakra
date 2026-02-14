import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, setAuthCookie } from '@/lib/auth'
import { logActivity, notifyUser } from '@/lib/activity'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Set auth cookie
    await setAuthCookie({
      id: user.id,
      email: user.email,
      name: user.name,
      role: (user as { role?: string }).role ?? 'user',
    })

    // Log activity
    const action = user.role === 'admin' ? 'admin_login' : 'user_logged_in'
    await logActivity({
      action: action as any,
      entityType: 'user',
      entityId: user.id,
      userId: user.id,
      metadata: { email: user.email },
    })

    // Send login notification to user
    const now = new Date()
    await notifyUser({
      userId: user.id,
      title: 'Welcome back!',
      message: `You signed in at ${now.toLocaleString()}`,
      type: 'user_logged_in',
      entityType: 'user',
      entityId: user.id,
    })

    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role ?? 'user',
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Login error:', error)
    
    // Provide more specific error messages for database connection issues
    if (error?.code === 'ETIMEDOUT' || error?.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'Database connection timeout. Please try again later.' },
        { status: 503 }
      )
    }
    if (error?.message?.includes('DATABASE_URL')) {
      return NextResponse.json(
        { error: 'Database configuration error.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

