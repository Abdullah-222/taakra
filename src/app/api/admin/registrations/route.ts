import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')
    const competitionId = searchParams.get('competitionId')

    const where: any = {}
    if (status) {
      where.status = status
    }
    if (paymentStatus) {
      where.paymentStatus = paymentStatus
    }
    if (competitionId) {
      where.competitionId = parseInt(competitionId)
    }

    const registrations = await prisma.competitionRegistration.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            snowPoints: true,
          },
        },
        competition: {
          select: {
            id: true,
            title: true,
            category: true,
            deadline: true,
            prize: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ registrations })
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}

