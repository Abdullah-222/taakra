import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_SECRET_KEY)

const SUPPORT_EMAIL = process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL || 'onboarding@zalnex.me'
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@zalnex.me'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, category, subject, message } = body

    if (!name || typeof name !== 'string' || !email || typeof email !== 'string' || !message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      )
    }

    const safeSubject = (subject && typeof subject === 'string') ? subject : 'Contact form submission'
    const safeCategory = (category && typeof category === 'string') ? category : ''
    const safePhone = (phone && typeof phone === 'string') ? phone : ''
    const categoryLabel = safeCategory ? `<p><strong>Topic:</strong> ${escapeHtml(safeCategory)}</p>` : ''
    const phoneLabel = safePhone ? `<p><strong>Phone:</strong> ${escapeHtml(safePhone)}</p>` : ''
    const html = `
      <h2>Contact form message</h2>
      <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
      ${phoneLabel}
      ${categoryLabel}
      <p><strong>Subject:</strong> ${escapeHtml(safeSubject)}</p>
      <hr />
      <pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(message)}</pre>
    `

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: SUPPORT_EMAIL,
      replyTo: email,
      subject: `[Contact] ${safeSubject.slice(0, 60)}`,
      html,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Message sent successfully', data },
      { status: 200 }
    )
  } catch (err: unknown) {
    console.error('Contact form error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
