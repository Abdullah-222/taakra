import { NextRequest, NextResponse } from 'next/server'
import { estimateDifficulty } from '@/lib/ai/ai.service'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const body = await req.json()
    const { title, description, category, rules } = body

    if (!title || !description || !category) {
      return NextResponse.json(
        { success: false, difficulty: null, error: 'Title, description, and category are required' },
        { status: 400 }
      )
    }

    const response = await estimateDifficulty(
      { title, description, category, rules },
      user?.id || null
    )

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in difficulty API:', error)
    return NextResponse.json(
      { success: false, difficulty: null, error: 'Failed to estimate difficulty' },
      { status: 500 }
    )
  }
}


