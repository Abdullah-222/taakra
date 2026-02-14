import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { notifyUser } from '@/lib/activity'

// GET: all messages in the single room, as a tree (top-level with nested replies)
export async function GET() {
  try {
    const topLevel = await prisma.chatMessage.findMany({
      where: { parentId: null },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: { id: true, email: true, name: true, imageUrl: true, role: true },
        },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: { id: true, email: true, name: true, imageUrl: true, role: true },
            },
            replies: {
              orderBy: { createdAt: 'asc' },
              include: {
                author: {
                  select: { id: true, email: true, name: true, imageUrl: true, role: true },
                },
                replies: {
                  orderBy: { createdAt: 'asc' },
                  include: {
                    author: {
                      select: { id: true, email: true, name: true, imageUrl: true, role: true },
                    },
                    replies: {
                      orderBy: { createdAt: 'asc' },
                      include: {
                        author: {
                          select: { id: true, email: true, name: true, imageUrl: true, role: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ messages: topLevel })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to load messages' },
      { status: 500 }
    )
  }
}

// POST: send a new message (top-level or reply)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { content, parentId } = body

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    const parentIdNum = parentId != null ? Number(parentId) : null
    if (parentIdNum != null) {
      const parent = await prisma.chatMessage.findUnique({
        where: { id: parentIdNum },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
      })
      if (!parent) {
        return NextResponse.json(
          { error: 'Parent message not found' },
          { status: 400 }
        )
      }

      // Notify the parent message author if it's not the same user
      if (parent.authorId !== user.id) {
        await notifyUser({
          userId: parent.authorId,
          title: 'New reply to your message',
          message: `${user.name || user.email} replied to your message: "${content.trim().substring(0, 50)}${content.trim().length > 50 ? '...' : ''}"`,
          type: 'chat_reply',
          entityType: 'chat_message',
          entityId: parentIdNum,
        })
      }
    }

    const message = await prisma.chatMessage.create({
      data: {
        content: content.trim(),
        authorId: user.id,
        parentId: parentIdNum,
      },
      include: {
        author: {
          select: { id: true, email: true, name: true, imageUrl: true, role: true },
        },
      },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
