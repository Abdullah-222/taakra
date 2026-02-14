import { NextRequest, NextResponse } from 'next/server'
import { simplifyRules } from '@/lib/ai/ai.service'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const body = await req.json()
    const { rules, competitionTitle } = body

    if (!rules || !competitionTitle) {
      return NextResponse.json(
        { success: false, simplified: '', error: 'Rules and competition title are required' },
        { status: 400 }
      )
    }

    const response = await simplifyRules(
      { rules, competitionTitle },
      user?.id || null
    )

    return NextResponse.json({
      success: response.success,
      simplified: response.reply,
      cached: response.cached,
      error: response.error,
    })
  } catch (error) {
    console.error('Error in simplify-rules API:', error)
    return NextResponse.json(
      { success: false, simplified: '', error: 'Failed to simplify rules' },
      { status: 500 }
    )
  }
}


