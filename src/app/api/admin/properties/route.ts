import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { logActivity } from '@/lib/activity'

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ properties })
  } catch (error) {
    console.error('Error fetching properties (admin):', error)
    return NextResponse.json(
      { error: 'Failed to load properties' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      title,
      description,
      price,
      location,
      images,
      videos,
    }: {
      title?: string
      description?: string
      price?: string
      location?: string
      images?: string[]
      videos?: string[]
    } = body

    if (!title || !description || !price || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const property = await prisma.property.create({
      data: {
        title,
        description,
        price,
        location,
        images: images ?? [],
        videos: videos ?? [],
        createdById: admin.id,
      },
    })

    // Log activity
    await logActivity({
      action: 'property_created',
      entityType: 'property',
      entityId: property.id,
      userId: admin.id,
      metadata: { title: property.title },
    })

    return NextResponse.json({ property }, { status: 201 })
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    )
  }
}

