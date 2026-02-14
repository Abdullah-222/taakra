import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { requireAdmin } from '@/lib/admin'
import { notifyUser } from '@/lib/activity'

// GET: Get conversations (user sees their own, admin sees all)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await requireAdmin()
    const url = new URL(req.url)
    const status = url.searchParams.get('status') || undefined

    if (isAdmin) {
      // Admin: get all conversations
      const conversations = await prisma.supportConversation.findMany({
        where: status ? { status } : undefined,
        orderBy: { updatedAt: 'desc' },
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
            take: 1, // Just get the latest message for preview
          },
          _count: {
            select: { messages: true },
          },
        },
      })

      return NextResponse.json({ conversations })
    } else {
      // User: get their own conversations
      const conversations = await prisma.supportConversation.findMany({
        where: {
          userId: user.id,
          ...(status ? { status } : {}),
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            include: {
              author: {
                select: { id: true, email: true, name: true, imageUrl: true, role: true },
              },
            },
          },
          _count: {
            select: { messages: true },
          },
        },
      })

      return NextResponse.json({ conversations })
    }
  } catch (error) {
    console.error('Error fetching support conversations:', error)
    return NextResponse.json(
      { error: 'Failed to load conversations' },
      { status: 500 }
    )
  }
}

// POST: Create a new support conversation (users only)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { subject, content } = body

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    // Create conversation with first message
    const conversation = await prisma.supportConversation.create({
      data: {
        userId: user.id,
        subject: subject?.trim() || null,
        messages: {
          create: {
            authorId: user.id,
            content: content.trim(),
          },
        },
      },
      include: {
        user: {
          select: { id: true, email: true, name: true, imageUrl: true },
        },
        messages: {
          include: {
            author: {
              select: { id: true, email: true, name: true, imageUrl: true, role: true },
            },
          },
        },
      },
    })

    // Notify all admins about new support request
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true },
    })

    for (const admin of admins) {
      await notifyUser({
        userId: admin.id,
        title: 'New support request',
        message: `${user.name || user.email} created a support conversation${subject ? `: ${subject}` : ''}`,
        type: 'support_request',
        entityType: 'support_conversation',
        entityId: conversation.id,
      })
    }

    return NextResponse.json({ conversation }, { status: 201 })
  } catch (error) {
    console.error('Error creating support conversation:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}


