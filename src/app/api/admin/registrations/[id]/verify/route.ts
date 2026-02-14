import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { notifyUser } from '@/lib/activity'
import { syncRegistrationToCalendar } from '@/lib/calendar/googleCalendar.service'

const resend = new Resend(process.env.RESEND_SECRET_KEY)
const fromEmail = process.env.RESEND_FROM_EMAIL || 'EstatePro <onboarding@resend.dev>'

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
        <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto;">
          <h2 style="color: #0f766e;">Payment approved</h2>
          <p>Hi ${participantName},</p>
          <p>Your payment for <strong>${compTitle}</strong> has been <strong>verified and approved</strong> by our team.</p>
          <div style="background: #f0fdfa; border-left: 4px solid #0d9488; padding: 12px 16px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Competition:</strong> ${compTitle}</p>
            <p style="margin: 8px 0 0 0;"><strong>Date &amp; time:</strong> ${formattedDate}</p>
            ${compCategory ? `<p style="margin: 8px 0 0 0;"><strong>Category:</strong> ${compCategory}</p>` : ''}
          </div>
          <p>You're all set. We'll see you there.</p>
          <p>— EstatePro Team</p>
        </div>
      `
      : `
        <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto;">
          <h2 style="color: #b91c1c;">Registration / payment not approved</h2>
          <p>Hi ${participantName},</p>
          <p>Your registration or payment for <strong>${compTitle}</strong> could not be approved.</p>
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 16px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Competition:</strong> ${compTitle}</p>
            <p style="margin: 8px 0 0 0;"><strong>Date &amp; time:</strong> ${formattedDate}</p>
            ${compCategory ? `<p style="margin: 8px 0 0 0;"><strong>Category:</strong> ${compCategory}</p>` : ''}
            <p style="margin: 12px 0 0 0;"><strong>Reason:</strong> ${reasonEscaped}</p>
          </div>
          <p>If you have questions, please reply to this email or contact support.</p>
          <p>— EstatePro Team</p>
        </div>
      `

    if (registration.user.email) {
      const { error: emailError } = await resend.emails.send({
        from: fromEmail,
        to: registration.user.email,
        subject: emailSubject,
        html: emailHtml,
      })
      if (emailError) {
        console.error('Resend email failed (registration status):', emailError)
        // Don't fail the request; in-app notification already sent
      }
    }

    return NextResponse.json({
      message: `Payment ${action === 'approve' ? 'verified' : 'rejected'} successfully`,
      registration: updatedRegistration,
    })
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    )
  }
}

