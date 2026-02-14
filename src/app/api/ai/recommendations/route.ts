import { NextRequest, NextResponse } from 'next/server'
import { generateRecommendations } from '@/lib/ai/ai.service'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, competitions: [], error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const response = await generateRecommendations(
      { userId: user.id },
      user.id
    )

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in recommendations API:', error)
    return NextResponse.json(
      { success: false, competitions: [], error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}


