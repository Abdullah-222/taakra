import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { requireAdmin } from '@/lib/admin'
import { notifyUser } from '@/lib/activity'

// GET: Get a specific conversation with all messages
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const conversationId = Number(id)

    if (isNaN(conversationId)) {
      return NextResponse.json({ error: 'Invalid conversation ID' }, { status: 400 })
    }

    const isAdmin = await requireAdmin()

    const conversation = await prisma.supportConversation.findUnique({
      where: { id: conversationId },
      include: {
        user: {
          select: { id: true, email: true, name: true, imageUrl: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: { id: true, email: true, name: true, imageUrl: true, role: true },
            },
          },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Check permissions: user can only see their own, admin can see all
    if (!isAdmin && conversation.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error('Error fetching support conversation:', error)
    return NextResponse.json(
      { error: 'Failed to load conversation' },
      { status: 500 }
    )
  }
}

// PATCH: Update conversation status (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const conversationId = Number(id)

    if (isNaN(conversationId)) {
      return NextResponse.json({ error: 'Invalid conversation ID' }, { status: 400 })
    }

    const body = await req.json()
    const { status } = body

    if (!status || !['open', 'closed', 'resolved'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be open, closed, or resolved' },
        { status: 400 }
      )
    }

    const conversation = await prisma.supportConversation.update({
      where: { id: conversationId },
      data: { status },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    })

    // Notify user if status changed
    if (status === 'resolved' || status === 'closed') {
      await notifyUser({
        userId: conversation.userId,
        title: 'Support conversation updated',
        message: `Your support conversation has been marked as ${status}.`,
        type: 'support_update',
        entityType: 'support_conversation',
        entityId: conversationId,
      })
    }

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error('Error updating support conversation:', error)
    return NextResponse.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    )
  }
}


