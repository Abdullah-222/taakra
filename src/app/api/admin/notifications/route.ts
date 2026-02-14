import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { id: true, role: true },
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit') || 20)

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: Math.min(Math.max(limit, 1), 50),
      }),
      prisma.notification.count({
        where: { userId: user.id, readAt: null },
      }),
    ])

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error('Failed to load notifications:', error)
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { id: true, role: true },
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const ids = Array.isArray(body?.ids) ? body.ids.map((id) => Number(id)) : null
    const markAll = body?.all === true

    if (!markAll && (!ids || ids.length === 0)) {
      return NextResponse.json({ error: 'No notifications selected' }, { status: 400 })
    }

    const now = new Date()

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: user.id, readAt: null },
        data: { readAt: now },
      })
    } else {
      await prisma.notification.updateMany({
        where: { userId: user.id, id: { in: ids! } },
        data: { readAt: now },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to update notifications:', error)
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
  }
}
