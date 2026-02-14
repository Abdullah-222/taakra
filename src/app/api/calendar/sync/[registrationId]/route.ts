import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { syncRegistrationToCalendar } from '@/lib/calendar/googleCalendar.service'
import { prisma } from '@/lib/prisma'

/**
 * Manually triggers calendar sync for a specific registration.
 * Used for retry functionality.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ registrationId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { registrationId: idParam } = await params
    const registrationId = parseInt(idParam)
    
    if (isNaN(registrationId)) {
      return NextResponse.json({ error: 'Invalid registration ID' }, { status: 400 })
    }
    
    // Verify registration belongs to user
    const registration = await prisma.competitionRegistration.findUnique({
      where: { id: registrationId },
      select: {
        userId: true,
        status: true,
      },
    })
    
    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }
    
    if (registration.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    if (registration.status !== 'approved') {
      return NextResponse.json(
        { error: 'Registration must be approved before syncing to calendar' },
        { status: 400 }
      )
    }
    
    // Attempt sync
    const result = await syncRegistrationToCalendar(registrationId)
    
    if (result.success) {
      return NextResponse.json({
        message: 'Successfully synced to calendar',
        eventId: result.eventId,
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to sync to calendar' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Calendar sync error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync to calendar' },
      { status: 500 }
    )
  }
}

