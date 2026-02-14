import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const registrations = await prisma.competitionRegistration.findMany({
      where: {
        userId: user.id,
      },
      include: {
        competition: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            deadline: true,
            prize: true,
            images: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Get user's calendar connection status
    const userWithCalendar = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        calendarConnected: true,
      },
    })

    return NextResponse.json({
      registrations,
      calendarConnected: userWithCalendar?.calendarConnected || false,
    })
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}

