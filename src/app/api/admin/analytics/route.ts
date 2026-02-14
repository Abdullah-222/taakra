import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'

export async function GET() {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [totalUsers, activeUsers, totalProperties, activities] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: {
            updatedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        }),
        prisma.property.count(),
        prisma.activityLog.findMany({
          take: 100,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        }),
      ])

    // Get property creation stats
    const propertiesLast30Days = await prisma.property.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    })

    // Get user registration stats
    const usersLast30Days = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    })

    // Generate daily stats for last 7 days
    const dailyStats = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dayActivities = await prisma.activityLog.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      })

      const dayProperties = await prisma.property.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      })

      const dayUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      })

      dailyStats.push({
        date: date.toISOString().split('T')[0],
        activities: dayActivities,
        properties: dayProperties,
        users: dayUsers,
      })
    }

    return NextResponse.json({
      analytics: {
        totalUsers,
        activeUsers,
        totalProperties,
        propertiesLast30Days,
        usersLast30Days,
        activities,
        dailyStats,
      },
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to load analytics' },
      { status: 500 }
    )
  }
}
