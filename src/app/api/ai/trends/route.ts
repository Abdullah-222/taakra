import { NextRequest, NextResponse } from 'next/server'
import { generateTrendSummary } from '@/lib/ai/ai.service'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, summary: '', error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const response = await generateTrendSummary(user.id)

    return NextResponse.json({
      success: response.success,
      summary: response.reply,
      cached: response.cached,
      error: response.error,
    })
  } catch (error) {
    console.error('Error in trends API:', error)
    return NextResponse.json(
      { success: false, summary: '', error: 'Failed to generate trends' },
      { status: 500 }
    )
  }
}


