import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cache competitions for 60 seconds (revalidate)
export const revalidate = 60

export async function GET() {
  try {
    const competitions = await prisma.competition.findMany({
      where: {
        status: 'published', // Only show published competitions to users
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    })

    return NextResponse.json(
      { competitions },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching competitions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitions' },
      { status: 500 }
    )
  }
}

