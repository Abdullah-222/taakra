import { NextRequest, NextResponse } from 'next/server'
import { generatePrepGuide } from '@/lib/ai/ai.service'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const body = await req.json()
    const { title, description, category, rules } = body

    if (!title || !description || !category) {
      return NextResponse.json(
        { success: false, guide: '', error: 'Title, description, and category are required' },
        { status: 400 }
      )
    }

    const response = await generatePrepGuide(
      { title, description, category, rules },
      user?.id || null
    )

    return NextResponse.json({
      success: response.success,
      guide: response.reply,
      cached: response.cached,
      error: response.error,
    })
  } catch (error) {
    console.error('Error in prep-guide API:', error)
    return NextResponse.json(
      { success: false, guide: '', error: 'Failed to generate prep guide' },
      { status: 500 }
    )
  }
}


