import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { requireAdmin } from '@/lib/admin'
import { notifyUser } from '@/lib/activity'

// POST: Send a message in a support conversation
export async function POST(
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

    const body = await req.json()
    const { content } = body

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    // Check if conversation exists and user has access
    const conversation = await prisma.supportConversation.findUnique({
      where: { id: conversationId },
      select: { id: true, userId: true, status: true },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const isAdmin = await requireAdmin()

    // Check permissions: user can only message their own, admin can message any
    if (!isAdmin && conversation.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if conversation is closed
    if (conversation.status === 'closed') {
      return NextResponse.json(
        { error: 'Cannot send message to closed conversation' },
        { status: 400 }
      )
    }

    // Create message
    const message = await prisma.supportMessage.create({
      data: {
        conversationId,
        authorId: user.id,
        content: content.trim(),
      },
      include: {
        author: {
          select: { id: true, email: true, name: true, imageUrl: true, role: true },
        },
      },
    })

    // Update conversation's updatedAt
    await prisma.supportConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    // Notify the other party
    if (isAdmin) {
      // Admin sent message, notify user
      await notifyUser({
        userId: conversation.userId,
        title: 'New reply from support',
        message: `You have a new message in your support conversation.`,
        type: 'support_message',
        entityType: 'support_conversation',
        entityId: conversationId,
      })
    } else {
      // User sent message, notify all admins
      const admins = await prisma.user.findMany({
        where: { role: 'admin' },
        select: { id: true },
      })

      for (const admin of admins) {
        await notifyUser({
          userId: admin.id,
          title: 'New message in support conversation',
          message: `${user.name || user.email} sent a new message.`,
          type: 'support_message',
          entityType: 'support_conversation',
          entityId: conversationId,
        })
      }
    }

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Error creating support message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}


