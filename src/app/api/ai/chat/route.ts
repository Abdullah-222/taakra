import { NextRequest, NextResponse } from 'next/server'
import { processChatMessage } from '@/lib/ai/ai.service'
import { getCurrentUser } from '@/lib/auth'

/**
 * POST /api/ai/chat
 * 
 * Handles AI chat messages via REST API
 * 
 * Request body:
 * {
 *   message: string
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   reply: string
 *   cached: boolean
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user (optional - allows anonymous users)
    const user = await getCurrentUser()
    const userId = user?.id || null

    // Parse request body
    const body = await req.json()
    const { message } = body

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          reply: 'Please provide a valid message.',
          cached: false,
        },
        { status: 400 }
      )
    }

    // Process message through AI service
    const response = await processChatMessage(message, userId)

    // Return response
    return NextResponse.json({
      success: response.success,
      reply: response.reply,
      cached: response.cached,
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      {
        success: false,
        reply: 'Sorry, I encountered an error. Please try again later.',
        cached: false,
      },
      { status: 500 }
    )
  }
}

