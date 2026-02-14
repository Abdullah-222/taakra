import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: idParam } = await params
    const id = parseInt(idParam)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid competition ID' }, { status: 400 })
    }

    const competition = await prisma.competition.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    })

    if (!competition) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 })
    }

    return NextResponse.json(competition)
  } catch (error) {
    console.error('Error fetching competition:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competition' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: idParam } = await params
    const id = parseInt(idParam)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid competition ID' }, { status: 400 })
    }

    // Check if competition exists
    const existing = await prisma.competition.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 })
    }

    const body = await req.json()
    const { title, description, rules, category, subcategory, deadline, prize, tags, status, images, videos } = body

    // Validation
    if (!title || !description || !category || !deadline || !prize) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate deadline is in the future (unless status is 'closed')
    const deadlineDate = new Date(deadline)
    if (status !== 'closed' && deadlineDate <= new Date()) {
      return NextResponse.json(
        { error: 'Deadline must be in the future' },
        { status: 400 }
      )
    }

    const competition = await prisma.competition.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description.trim(),
        rules: rules?.trim() || null,
        category: category.trim(),
        subcategory: subcategory?.trim() || null,
        deadline: deadlineDate,
        prize: prize.trim(),
        tags: tags || [],
        images: images || [],
        videos: videos || [],
        status: status || 'draft',
      },
    })

    return NextResponse.json(competition)
  } catch (error) {
    console.error('Error updating competition:', error)
    return NextResponse.json(
      { error: 'Failed to update competition' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: idParam } = await params
    const id = parseInt(idParam)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid competition ID' }, { status: 400 })
    }

    // Check if competition exists
    const existing = await prisma.competition.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 })
    }

    // Delete the competition (cascade will handle registrations)
    await prisma.competition.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Competition deleted successfully' })
  } catch (error) {
    console.error('Error deleting competition:', error)
    return NextResponse.json(
      { error: 'Failed to delete competition' },
      { status: 500 }
    )
  }
}

