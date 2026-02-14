import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { notifyUser } from '@/lib/activity'
import { syncRegistrationToCalendar } from '@/lib/calendar/googleCalendar.service'

const resendApiKey = process.env.RESEND_SECRET_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@zalnex.me'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: idParam } = await params
    const registrationId = parseInt(idParam)
    if (isNaN(registrationId)) {
      return NextResponse.json({ error: 'Invalid registration ID' }, { status: 400 })
    }

    const body = await req.json()
    const { action, rejectionReason, internalNotes } = body // action: "approve" | "reject"

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "approve" or "reject"' }, { status: 400 })
    }

    // Get registration with competition info (including deadline for email)
    const registration = await prisma.competitionRegistration.findUnique({
      where: { id: registrationId },
      include: {
        competition: {
          select: {
            title: true,
            deadline: true,
            category: true,
          },
        },
        user: {
          select: {
            email: true,
            name: true,
            calendarConnected: true,
          },
        },
      },
    })

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Update registration (allow updating status anytime: pending → approved/rejected, or flipping approved ↔ rejected)
    const updateData: any = {
      paymentStatus: action === 'approve' ? 'approved' : 'rejected',
      status: action === 'approve' ? 'approved' : 'rejected',
      updatedAt: new Date(),
    }

    if (action === 'reject') {
      if (!rejectionReason || rejectionReason.trim() === '') {
        return NextResponse.json(
          { error: 'Rejection reason is required when rejecting payment' },
          { status: 400 }
        )
      }
      updateData.rejectionReason = rejectionReason.trim()
    } else {
      updateData.rejectionReason = null
    }

    if (internalNotes !== undefined) {
      updateData.internalNotes = internalNotes?.trim() || null
    }

    const updatedRegistration = await prisma.competitionRegistration.update({
      where: { id: registrationId },
      data: updateData,
      include: {
        competition: {
          select: {
            title: true,
          },
        },
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    // If payment is approved, attempt to sync to calendar if user has connected
    // This is fire-and-forget - calendar failures should not block approval
    if (action === 'approve' && registration.user.calendarConnected) {
      syncRegistrationToCalendar(registrationId).catch((err) => {
        console.error(`Failed to sync registration ${registrationId} to calendar:`, err)
        // Error is logged but doesn't affect the approval process
      })
    }

    // Notify user in-app
    if (action === 'approve') {
      await notifyUser({
        userId: registration.userId,
        title: 'Payment Verified ✅',
        message: `Your payment for "${registration.competition.title}" has been verified and approved.`,
        type: 'payment_approved',
        entityType: 'competition',
        entityId: registration.competitionId,
      })
    } else {
      await notifyUser({
        userId: registration.userId,
        title: 'Payment Rejected ❌',
        message: `Your payment for "${registration.competition.title}" has been rejected. Reason: ${rejectionReason}`,
        type: 'payment_rejected',
        entityType: 'competition',
        entityId: registration.competitionId,
      })
    }

    // Email participant via Resend
    const competitionDate = new Date(registration.competition.deadline)
    const formattedDate = competitionDate.toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    })
    const participantName = escapeHtml(registration.user.name?.trim() || registration.user.email)
    const compTitle = escapeHtml(registration.competition.title)
    const compCategory = registration.competition.category ? escapeHtml(registration.competition.category) : ''
    const reasonEscaped = escapeHtml((rejectionReason || 'No reason provided.').trim())
    const isApproved = action === 'approve'

    const emailSubject = isApproved
      ? `✅ Approved: ${registration.competition.title}`
      : `❌ Registration update: ${registration.competition.title}`

    const emailHtml = isApproved
      ? `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; background: #f6f9fc; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 32px rgba(31, 38, 135, 0.12);">
          <div style="background: linear-gradient(135deg, #007aff 0%, #0062cc 100%); padding: 24px 32px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">❄️ Taakra · Payment approved</h1>
          </div>
          <div style="padding: 28px 32px;">
            <p style="margin: 0 0 16px; color: #1e293b; font-size: 16px;">Hi ${participantName},</p>
            <p style="margin: 0 0 20px; color: #475569; font-size: 15px; line-height: 1.5;">Your payment for <strong>${compTitle}</strong> has been <strong>verified and approved</strong> by our team.</p>
            <div style="background: rgba(0, 122, 255, 0.08); border: 1px solid rgba(0, 122, 255, 0.2); border-radius: 16px; padding: 16px 20px; margin: 0 0 20px;">
              <p style="margin: 0 0 6px;"><strong style="color: #1e293b;">Competition:</strong> ${compTitle}</p>
              <p style="margin: 0 0 6px;"><strong style="color: #1e293b;">Date &amp; time:</strong> ${formattedDate}</p>
              ${compCategory ? `<p style="margin: 0;"><strong style="color: #1e293b;">Category:</strong> ${compCategory}</p>` : ''}
            </div>
            <p style="margin: 0 0 20px; color: #475569; font-size: 15px;">You're all set. We'll see you there.</p>
            <p style="margin: 0; color: #94a3b8; font-size: 13px;">— Taakra Team</p>
          </div>
        </div>
      `
      : `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; background: #f6f9fc; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 32px rgba(31, 38, 135, 0.12);">
          <div style="background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%); padding: 24px 32px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">❄️ Taakra · Registration update</h1>
          </div>
          <div style="padding: 28px 32px;">
            <p style="margin: 0 0 16px; color: #1e293b; font-size: 16px;">Hi ${participantName},</p>
            <p style="margin: 0 0 20px; color: #475569; font-size: 15px; line-height: 1.5;">Your registration or payment for <strong>${compTitle}</strong> could not be approved.</p>
            <div style="background: rgba(185, 28, 28, 0.08); border: 1px solid rgba(185, 28, 28, 0.25); border-radius: 16px; padding: 16px 20px; margin: 0 0 20px;">
              <p style="margin: 0 0 6px;"><strong style="color: #1e293b;">Competition:</strong> ${compTitle}</p>
              <p style="margin: 0 0 6px;"><strong style="color: #1e293b;">Date &amp; time:</strong> ${formattedDate}</p>
              ${compCategory ? `<p style="margin: 0 0 8px;"><strong style="color: #1e293b;">Category:</strong> ${compCategory}</p>` : ''}
              <p style="margin: 0;"><strong style="color: #1e293b;">Reason:</strong> ${reasonEscaped}</p>
            </div>
            <p style="margin: 0 0 20px; color: #475569; font-size: 14px;">If you have questions, please reply to this email or contact support.</p>
            <p style="margin: 0; color: #94a3b8; font-size: 13px;">— Taakra Team</p>
          </div>
        </div>
      `

    let emailSent = false
    let emailError: string | undefined
    const toEmail = registration.user?.email
    if (toEmail) {
      if (!resend) {
        emailError = 'RESEND_SECRET_KEY is not set. Set it in .env to send notification emails.'
        console.warn('Resend skipped (no API key):', emailError)
      } else {
        console.log('[registration-verify] Sending email to participant:', toEmail, 'from:', fromEmail)
        const { data, error: sendErr } = await resend.emails.send({
          from: fromEmail,
          to: toEmail,
          subject: emailSubject,
          html: emailHtml,
        })
        if (sendErr) {
          emailError = sendErr.message || 'Failed to send email'
          console.error('[registration-verify] Resend error:', sendErr)
        } else {
          emailSent = true
          console.log('[registration-verify] Email sent successfully, id:', data?.id)
        }
      }
    } else {
      emailError = 'Participant has no email address on file.'
      console.warn('[registration-verify] Skipped send: no participant email')
    }

    return NextResponse.json({
      message: `Payment ${action === 'approve' ? 'verified' : 'rejected'} successfully`,
      registration: updatedRegistration,
      emailSent,
      emailError: emailError ?? undefined,
    })
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    )
  }
}

