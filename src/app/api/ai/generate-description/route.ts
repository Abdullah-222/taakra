import { NextRequest, NextResponse } from 'next/server'
import { generateDescription } from '@/lib/ai/ai.service'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, description: '', error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { title, category, prize, deadline } = body

    if (!title || !category || !prize || !deadline) {
      return NextResponse.json(
        { success: false, description: '', error: 'All fields are required' },
        { status: 400 }
      )
    }

    const response = await generateDescription(
      { title, category, prize, deadline },
      user.id
    )

    return NextResponse.json({
      success: response.success,
      description: response.reply,
      cached: response.cached,
      error: response.error,
    })
  } catch (error) {
    console.error('Error in generate-description API:', error)
    return NextResponse.json(
      { success: false, description: '', error: 'Failed to generate description' },
      { status: 500 }
    )
  }
}


