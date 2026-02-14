import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getAuthorizationUrl } from '@/lib/calendar/googleCalendar.service'

/**
 * Initiates Google Calendar OAuth flow.
 * Returns the authorization URL to redirect the user to.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Generate state parameter for CSRF protection (using user ID)
    const state = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64')
    
    const authUrl = getAuthorizationUrl(state)
    
    return NextResponse.json({ authUrl })
  } catch (error: any) {
    console.error('Calendar connect error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initiate calendar connection' },
      { status: 500 }
    )
  }
}

