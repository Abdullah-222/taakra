import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getCurrentUser } from '@/lib/auth'

const resend = new Resend(process.env.RESEND_SECRET_KEY)

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { subject, html, to } = body

    const recipientEmail = to || user.email

    if (!subject || !html) {
      return NextResponse.json(
        { error: 'Subject and HTML content are required' },
        { status: 400 }
      )
    }

    const { data, error } = await resend.emails.send({
      from: 'onboarding@zalnex.me',
      to: recipientEmail,
      subject: subject,
      html: html,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Email sent successfully',
        data: data,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

