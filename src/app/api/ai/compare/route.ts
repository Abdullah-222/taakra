import { NextRequest, NextResponse } from 'next/server'
import { compareCompetitions } from '@/lib/ai/ai.service'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const body = await req.json()
    const { competitionId1, competitionId2 } = body

    if (!competitionId1 || !competitionId2) {
      return NextResponse.json(
        { success: false, comparison: '', error: 'Both competition IDs are required' },
        { status: 400 }
      )
    }

    const response = await compareCompetitions(
      { competitionId1: Number(competitionId1), competitionId2: Number(competitionId2) },
      user?.id || null
    )

    return NextResponse.json({
      success: response.success,
      comparison: response.reply,
      cached: response.cached,
      error: response.error,
    })
  } catch (error) {
    console.error('Error in compare API:', error)
    return NextResponse.json(
      { success: false, comparison: '', error: 'Failed to compare competitions' },
      { status: 500 }
    )
  }
}


