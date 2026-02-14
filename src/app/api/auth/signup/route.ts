import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, setAuthCookie } from '@/lib/auth'
import { logActivity } from '@/lib/activity'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user in transaction (check duplicates, count, and create atomically)
    let user
    try {
      user = await prisma.$transaction(async (tx) => {
        // Check if user already exists inside transaction to prevent race conditions
        const existingUser = await tx.user.findUnique({
          where: { email },
        })

        if (existingUser) {
          throw new Error('DUPLICATE_USER')
        }

        // First user becomes admin - check and create atomically
        const userCount = await tx.user.count()
        const role = userCount === 0 ? 'admin' : 'user'

        return await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            name: name || null,
            role,
          },
        })
      })
    } catch (e: any) {
      if (e.message === 'DUPLICATE_USER') {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        )
      }
      throw e // Re-throw other errors
    }

    // Set auth cookie - if this fails, rollback user creation
    try {
      await setAuthCookie({
        id: user.id,
        email: user.email,
        name: user.name,
        role: (user as { role?: string }).role ?? 'user',
      })
    } catch (cookieError) {
      // Rollback: delete user in transaction to maintain consistency
      await prisma.$transaction(async (tx) => {
        await tx.user.delete({
          where: { id: user.id },
        })
      })
      console.error('Cookie setting failed, user creation rolled back:', cookieError)
      return NextResponse.json(
        { error: 'Failed to set authentication cookie. User creation was rolled back.' },
        { status: 500 }
      )
    }

    // Log activity
    await logActivity({
      action: 'user_registered',
      entityType: 'user',
      entityId: user.id,
      userId: user.id,
      metadata: { email: user.email, role: user.role },
    })

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

