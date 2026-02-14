import { NextRequest, NextResponse } from 'next/server'
import { generateCompetitionRules } from '@/lib/ai/ai.service'
import { getCurrentUser } from '@/lib/auth'

/**
 * POST /api/ai/generate-rules
 * 
 * Generates competition rules using AI
 * 
 * Request body:
 * {
 *   title: string
 *   description: string
 *   category: string
 *   subcategory?: string
 *   prize?: string
 *   tags?: string[]
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   rules: string
 *   cached: boolean
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user (required for admin)
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          rules: '',
          cached: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { title, description, category, subcategory, prize, tags } = body

    // Validate input
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          rules: '',
          cached: false,
          error: 'Title is required',
        },
        { status: 400 }
      )
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          rules: '',
          cached: false,
          error: 'Description is required',
        },
        { status: 400 }
      )
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          rules: '',
          cached: false,
          error: 'Category is required',
        },
        { status: 400 }
      )
    }

    // Generate rules
    const response = await generateCompetitionRules(
      {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        subcategory: subcategory?.trim(),
        prize: prize?.trim(),
        tags: Array.isArray(tags) ? tags : undefined,
      },
      user.id
    )

    // Return response
    return NextResponse.json({
      success: response.success,
      rules: response.reply,
      cached: response.cached,
      error: response.error,
    })
  } catch (error) {
    console.error('Error in generate-rules API:', error)
    return NextResponse.json(
      {
        success: false,
        rules: '',
        cached: false,
        error: 'Sorry, I encountered an error generating rules. Please try again later.',
      },
      { status: 500 }
    )
  }
}


