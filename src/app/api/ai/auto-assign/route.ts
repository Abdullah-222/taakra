import { NextRequest, NextResponse } from 'next/server'
import { autoAssignMetadata } from '@/lib/ai/ai.service'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { title, description } = body

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Title and description are required' },
        { status: 400 }
      )
    }

    const response = await autoAssignMetadata(title, description, user.id)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in auto-assign API:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to auto-assign metadata' },
      { status: 500 }
    )
  }
}


