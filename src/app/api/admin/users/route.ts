import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { hashPassword } from '@/lib/auth'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_SECRET_KEY)

function generatePassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ users })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  try {
    const body = await request.json()
    const { email, name } = body as { email?: string; name?: string }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()

    const password = generatePassword()
    const hashedPassword = await hashPassword(password)

    // Create user in transaction - check for duplicates atomically
    let user
    try {
      user = await prisma.$transaction(async (tx) => {
        // Check for existing user inside transaction to prevent race conditions
        const existing = await tx.user.findUnique({
          where: { email: trimmedEmail },
        })
        if (existing) {
          throw new Error('DUPLICATE_USER')
        }

        return await tx.user.create({
          data: {
            email: trimmedEmail,
            name: (typeof name === 'string' && name.trim()) ? name.trim() : null,
            password: hashedPassword,
            role: 'user',
          },
        })
      })
    } catch (e: any) {
      if (e.message === 'DUPLICATE_USER') {
        return NextResponse.json(
          { error: 'A user with this email already exists' },
          { status: 400 }
        )
      }
      throw e // Re-throw other errors
    }

    // Send email - if this fails, rollback user creation
    const from = process.env.RESEND_FROM_EMAIL || 'onboarding@zalnex.me'
    const { error } = await resend.emails.send({
      from,
      to: trimmedEmail,
      subject: 'Your EstatePro account credentials',
      html: `
        <h2>Your EstatePro account has been created</h2>
        <p>An administrator has created an account for you. Use the credentials below to sign in.</p>
        <p><strong>Email:</strong> ${trimmedEmail}</p>
        <p><strong>Password:</strong> <code style="background:#f0f0f0;padding:4px 8px;border-radius:4px;">${password}</code></p>
        <p>Please sign in at your app login page and change your password if desired.</p>
        <p>— EstatePro Team</p>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      // Rollback: delete user in transaction to maintain consistency
      await prisma.$transaction(async (tx) => {
        await tx.user.delete({
          where: { id: user.id },
        })
      })
      return NextResponse.json(
        { error: 'Failed to send credentials email. User creation was rolled back: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'User created and credentials sent by email',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
