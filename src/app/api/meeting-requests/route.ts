import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logActivity, notifyUser } from '@/lib/activity'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { propertyId, email, name, message } = body

    if (!propertyId || !email) {
      return NextResponse.json(
        { error: 'Property ID and email are required' },
        { status: 400 }
      )
    }

    // Validate property exists
    const property = await prisma.property.findUnique({
      where: { id: Number(propertyId) },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Create meeting request
    const meetingRequest = await prisma.meetingRequest.create({
      data: {
        propertyId: Number(propertyId),
        email: email.trim().toLowerCase(),
        name: name?.trim() || null,
        message: message?.trim() || null,
        status: 'pending',
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    // Log activity
    await logActivity({
      action: 'system_event',
      entityType: 'system',
      metadata: {
        event: 'meeting_request_created',
        propertyId: property.id,
        propertyTitle: property.title,
        email: meetingRequest.email,
      },
    })

    // Find user by email to send notification
    const user = await prisma.user.findUnique({
      where: { email: meetingRequest.email },
    })

    if (user) {
      await notifyUser({
        userId: user.id,
        title: 'Meeting request submitted',
        message: `Your video meeting request for ${property.title} has been submitted and is pending approval.`,
        type: 'meeting_request_created',
        entityType: 'meeting_request',
        entityId: meetingRequest.id,
      })
    }

    return NextResponse.json(
      {
        message: 'Meeting request submitted successfully',
        request: meetingRequest,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating meeting request:', error)
    return NextResponse.json(
      { error: 'Failed to submit meeting request' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
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
