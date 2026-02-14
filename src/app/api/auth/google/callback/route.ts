import { NextRequest, NextResponse } from 'next/server'

/**
 * Redirect handler for Google OAuth callback.
 * 
 * This route handles redirects from Google OAuth when the redirect URI
 * is set to /api/auth/google/callback in Google Cloud Console.
 * 
 * It forwards the request to the calendar callback handler.
 * 
 * NOTE: The correct redirect URI should be /api/calendar/callback
 * Update Google Cloud Console to use the correct URI for new setups.
 */
export async function GET(req: NextRequest) {
  try {
    // Forward all query parameters to the calendar callback
    const searchParams = req.nextUrl.searchParams
    
    // Build the calendar callback URL with the same origin
    const baseUrl = req.nextUrl.origin
    const redirectUrl = new URL('/api/calendar/callback', baseUrl)
    
    // Copy all query parameters
    searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value)
    })
    
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Google callback redirect error:', error)
    // Fallback: redirect to registrations with error
    const baseUrl = req.nextUrl.origin
    return NextResponse.redirect(
      new URL('/registrations?calendar_error=callback_error', baseUrl)
    )
  }
}

