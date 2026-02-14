import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { logActivity, notifyUser } from '@/lib/activity'

export async function GET() {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requests = await prisma.meetingRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Error fetching meeting requests:', error)
    return NextResponse.json(
      { error: 'Failed to load meeting requests' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { requestId, action } = body // action: "approve" | "reject"

    if (!requestId || !action) {
      return NextResponse.json(
        { error: 'Request ID and action are required' },
        { status: 400 }
      )
    }

    const meetingRequest = await prisma.meetingRequest.findUnique({
      where: { id: Number(requestId) },
      include: {
        property: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!meetingRequest) {
      return NextResponse.json(
        { error: 'Meeting request not found' },
        { status: 404 }
      )
    }

    if (action === 'reject') {
      await prisma.meetingRequest.update({
        where: { id: Number(requestId) },
        data: {
          status: 'rejected',
          approvedById: admin.id,
        },
      })

      await logActivity({
        action: 'system_event',
        entityType: 'system',
        userId: admin.id,
        metadata: {
          event: 'meeting_request_rejected',
          requestId: meetingRequest.id,
          propertyTitle: meetingRequest.property.title,
        },
      })

      // Notify user about rejection
      const user = await prisma.user.findUnique({
        where: { email: meetingRequest.email },
      })

      if (user) {
        await notifyUser({
          userId: user.id,
          title: 'Meeting request rejected',
          message: `Your video meeting request for ${meetingRequest.property.title} has been rejected.`,
          type: 'meeting_request_rejected',
          entityType: 'meeting_request',
          entityId: meetingRequest.id,
        })
      }

      return NextResponse.json({ message: 'Request rejected' })
    }

    if (action === 'approve') {
      // Create room using 100ms API
      if (!process.env.MANAGEMENT_TOKEN || !process.env.TEMPLATE_ID) {
        return NextResponse.json(
          { error: 'Room creation not configured' },
          { status: 500 }
        )
      }

      const roomName = `property-${meetingRequest.propertyId}-${Date.now()}`
      const roomRes = await fetch('https://api.100ms.live/v2/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.MANAGEMENT_TOKEN}`,
        },
        body: JSON.stringify({
          name: roomName,
          template_id: process.env.TEMPLATE_ID,
        }),
      })

      if (!roomRes.ok) {
        const errorText = await roomRes.text()
        console.error('100ms API error:', errorText)
        return NextResponse.json(
          { error: 'Failed to create room' },
          { status: 500 }
        )
      }

      const roomData = await roomRes.json()
      const roomId = roomData.id || roomData.room_id
      const roomCode = roomData.code || roomData.room_code

      // Generate room URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const roomUrl = `${baseUrl}/meeting?room=${roomId}`

      // Update meeting request
      const updatedRequest = await prisma.meetingRequest.update({
        where: { id: Number(requestId) },
        data: {
          status: 'approved',
          roomId: roomId.toString(),
          roomCode: roomCode?.toString() || null,
          roomUrl,
          approvedById: admin.id,
        },
      })

      // Send email with room link
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_SECRET_KEY)
      const from = process.env.RESEND_FROM_EMAIL || 'onboarding@zalnex.me'

      await resend.emails.send({
        from,
        to: meetingRequest.email,
        subject: `Your Video Meeting Room for ${meetingRequest.property.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Your Meeting Room is Ready!</h2>
            <p>Hello${meetingRequest.name ? ` ${meetingRequest.name}` : ''},</p>
            <p>Your meeting request for <strong>${meetingRequest.property.title}</strong> has been approved.</p>
            <p>Join your video meeting room using the link below:</p>
            <div style="margin: 24px 0;">
              <a href="${roomUrl}" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Join Meeting Room
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              Room ID: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${roomId}</code>
            </p>
            ${roomCode ? `<p style="color: #6b7280; font-size: 14px;">Room Code: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${roomCode}</code></p>` : ''}
            <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
              If you have any questions, please contact us.
            </p>
            <p style="margin-top: 24px; color: #6b7280; font-size: 12px;">
              — EstatePro Team
            </p>
          </div>
        `,
      })

      await logActivity({
        action: 'system_event',
        entityType: 'system',
        userId: admin.id,
        metadata: {
          event: 'meeting_request_approved',
          requestId: meetingRequest.id,
          propertyTitle: meetingRequest.property.title,
          roomId,
        },
      })

      // Notify user about approval
      const user = await prisma.user.findUnique({
        where: { email: meetingRequest.email },
      })

      if (user) {
        await notifyUser({
          userId: user.id,
          title: 'Meeting request approved! 🎉',
          message: `Your video meeting request for ${meetingRequest.property.title} has been approved. Check your email for the room link.`,
          type: 'meeting_request_approved',
          entityType: 'meeting_request',
          entityId: meetingRequest.id,
        })
      }

      return NextResponse.json({
        message: 'Request approved and email sent',
        request: updatedRequest,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error processing meeting request:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
