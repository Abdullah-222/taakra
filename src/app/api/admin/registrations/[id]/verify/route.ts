import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { notifyUser } from '@/lib/activity'

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

    // Get registration with competition info
    const registration = await prisma.competitionRegistration.findUnique({
      where: { id: registrationId },
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

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Update registration
    const updateData: any = {
      paymentStatus: action === 'approve' ? 'approved' : 'rejected',
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
      // Clear rejection reason when approving
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

    // If payment is approved, also approve the registration
    if (action === 'approve' && registration.status === 'pending') {
      await prisma.competitionRegistration.update({
        where: { id: registrationId },
        data: { status: 'approved' },
      })
    }

    // Notify user
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

