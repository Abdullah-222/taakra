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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
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

    // Send email - if this fails, rollback user creation (Taakra-themed)
    const from = process.env.RESEND_FROM_EMAIL || 'onboarding@zalnex.me'
    const displayName = (typeof name === 'string' && name.trim()) ? escapeHtml(name.trim()) : 'there'
    const { error } = await resend.emails.send({
      from,
      to: trimmedEmail,
      subject: 'Your Taakra account is ready',
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; background: #f6f9fc; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 32px rgba(31, 38, 135, 0.12);">
          <div style="background: linear-gradient(135deg, #007aff 0%, #0062cc 100%); padding: 28px 32px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;">❄️ Taakra</h1>
            <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Your account has been created</p>
          </div>
          <div style="padding: 32px;">
            <p style="margin: 0 0 16px; color: #1e293b; font-size: 16px;">Hi ${displayName},</p>
            <p style="margin: 0 0 24px; color: #475569; font-size: 15px; line-height: 1.5;">An administrator has created a Taakra account for you. Use the credentials below to sign in.</p>
            <div style="background: rgba(0, 122, 255, 0.08); border: 1px solid rgba(0, 122, 255, 0.2); border-radius: 16px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;">Email</p>
              <p style="margin: 0 0 16px; font-size: 15px; color: #1e293b; font-weight: 500;">${escapeHtml(trimmedEmail)}</p>
              <p style="margin: 0 0 8px; font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;">Temporary password</p>
              <p style="margin: 0; font-size: 15px; color: #1e293b;"><code style="background: rgba(255,255,255,0.8); padding: 8px 12px; border-radius: 8px; font-family: ui-monospace, monospace; font-weight: 500;">${password}</code></p>
            </div>
            <p style="margin: 0 0 24px; color: #475569; font-size: 14px; line-height: 1.5;">Sign in at your app login page and change your password after your first login if you’d like.</p>
            <p style="margin: 0; color: #94a3b8; font-size: 13px;">— Taakra Team</p>
          </div>
        </div>
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
