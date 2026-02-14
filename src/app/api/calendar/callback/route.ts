import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { exchangeCodeForTokens, syncRegistrationToCalendar } from '@/lib/calendar/googleCalendar.service'
import { prisma } from '@/lib/prisma'

/**
 * Handles Google OAuth callback.
 * Exchanges code for tokens and optionally syncs pending registrations.
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    
    if (error) {
      return NextResponse.redirect(
        new URL(`/registrations?calendar_error=${encodeURIComponent(error)}`, req.url)
      )
    }
    
    if (!code) {
      return NextResponse.redirect(
        new URL('/registrations?calendar_error=no_code', req.url)
      )
    }
    
    // Decode state to get user ID
    let userId: number
    try {
      if (!state) {
        throw new Error('No state parameter')
      }
      const decoded = JSON.parse(Buffer.from(state, 'base64').toString())
      userId = decoded.userId
    } catch {
      // Fallback: get user from session
      const user = await getCurrentUser()
      if (!user) {
        return NextResponse.redirect(
          new URL('/login?redirect=/api/calendar/callback', req.url)
        )
      }
      userId = user.id
    }
    
    // Exchange code for tokens
    await exchangeCodeForTokens(code, userId)
    
    // After successful connection, sync any approved registrations that haven't been synced yet
    const approvedRegistrations = await prisma.competitionRegistration.findMany({
      where: {
        userId,
        status: 'approved',
        calendarSynced: false,
      },
      select: {
        id: true,
      },
    })
    
    // Sync each registration (fire and forget - don't block redirect)
    for (const registration of approvedRegistrations) {
      syncRegistrationToCalendar(registration.id).catch((err) => {
        console.error(`Failed to sync registration ${registration.id}:`, err)
      })
    }
    
    // Redirect to registrations page with success message
    return NextResponse.redirect(
      new URL('/registrations?calendar_connected=true', req.url)
    )
  } catch (error: any) {
    console.error('Calendar callback error:', error)
    return NextResponse.redirect(
      new URL(
        `/registrations?calendar_error=${encodeURIComponent(error.message || 'Failed to connect calendar')}`,
        req.url
      )
    )
  }
}


