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
    const search = searchParams.get('search')?.trim() || null
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

    const where: any = {}
    if (status) {
      where.status = status
    }
    if (paymentStatus) {
      where.paymentStatus = paymentStatus
    }
    if (competitionId) {
      const id = parseInt(competitionId)
      if (!isNaN(id)) where.competitionId = id
    }
    if (search) {
      where.OR = [
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { competition: { title: { contains: search, mode: 'insensitive' } } },
        { transactionId: { contains: search, mode: 'insensitive' } },
      ]
    }

    type OrderByOption = { createdAt?: 'asc' | 'desc'; paymentStatus?: 'asc' | 'desc'; status?: 'asc' | 'desc'; user?: { email: 'asc' | 'desc' }; competition?: { title: 'asc' | 'desc' } }
    let orderBy: OrderByOption = { createdAt: 'desc' }
    if (sortBy === 'createdAt') orderBy = { createdAt: sortOrder }
    else if (sortBy === 'paymentStatus') orderBy = { paymentStatus: sortOrder }
    else if (sortBy === 'status') orderBy = { status: sortOrder }
    else if (sortBy === 'userEmail') orderBy = { user: { email: sortOrder } }
    else if (sortBy === 'competitionTitle') orderBy = { competition: { title: sortOrder } }

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
      orderBy,
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

