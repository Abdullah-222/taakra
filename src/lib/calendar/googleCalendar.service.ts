/**
 * Google Calendar Service
 * 
 * Single source of truth for all Google Calendar operations.
 * Handles OAuth, token refresh, and event creation.
 * 
 * This service is provider-agnostic in design to support future calendar providers.
 */

import { prisma } from '@/lib/prisma'
import { encrypt, decrypt } from '@/lib/encryption'

// Google OAuth and Calendar API configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/calendar/callback`
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar.events'
const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3'

/**
 * Validates that required Google OAuth environment variables are set.
 */
function validateConfig() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.')
  }
}

/**
 * Generates the Google OAuth authorization URL.
 */
export function getAuthorizationUrl(state?: string): string {
  validateConfig()
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID!,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: GOOGLE_SCOPES,
    access_type: 'offline', // Required to get refresh token
    prompt: 'consent', // Force consent screen to get refresh token
    ...(state && { state }),
  })
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * Exchanges authorization code for access and refresh tokens.
 * Stores encrypted refresh token in database.
 */
export async function exchangeCodeForTokens(
  code: string,
  userId: number
): Promise<{ accessToken: string; refreshToken: string }> {
  validateConfig()
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: 'authorization_code',
      redirect_uri: GOOGLE_REDIRECT_URI,
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code for tokens: ${error}`)
  }
  
  const data = await response.json()
  
  if (!data.refresh_token) {
    throw new Error('No refresh token received. User may have already granted permission.')
  }
  
  // Encrypt and store refresh token
  const encryptedToken = encrypt(data.refresh_token)
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      googleRefreshToken: encryptedToken,
      calendarConnected: true,
    },
  })
  
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  }
}

/**
 * Refreshes an access token using the stored refresh token.
 * Updates the stored refresh token if a new one is provided.
 */
export async function refreshAccessToken(userId: number): Promise<string> {
  validateConfig()
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { googleRefreshToken: true },
  })
  
  if (!user?.googleRefreshToken) {
    throw new Error('User has no stored refresh token. Please reconnect Google Calendar.')
  }
  
  // Decrypt refresh token
  let refreshToken: string
  try {
    refreshToken = decrypt(user.googleRefreshToken)
  } catch (error) {
    throw new Error('Failed to decrypt refresh token. Please reconnect Google Calendar.')
  }
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    
    // If refresh token is invalid, mark user as disconnected
    if (response.status === 400) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          googleRefreshToken: null,
          calendarConnected: false,
        },
      })
    }
    
    throw new Error(`Failed to refresh access token: ${error}`)
  }
  
  const data = await response.json()
  
  // If a new refresh token is provided, update it
  if (data.refresh_token) {
    const encryptedToken = encrypt(data.refresh_token)
    await prisma.user.update({
      where: { id: userId },
      data: { googleRefreshToken: encryptedToken },
    })
  }
  
  return data.access_token
}

/**
 * Gets a valid access token for a user.
 * Refreshes if necessary.
 */
async function getValidAccessToken(userId: number): Promise<string> {
  // For now, always refresh. In production, you might cache access tokens.
  return refreshAccessToken(userId)
}

/**
 * Creates a Google Calendar event for a competition registration.
 * Returns the event ID.
 * 
 * This function is idempotent - it checks if the event already exists before creating.
 */
export async function createCalendarEvent(
  registrationId: number
): Promise<string> {
  // Get registration with competition and user info
  const registration = await prisma.competitionRegistration.findUnique({
    where: { id: registrationId },
    include: {
      competition: {
        select: {
          title: true,
          description: true,
          deadline: true,
        },
      },
      user: {
        select: {
          id: true,
          calendarConnected: true,
        },
      },
    },
  })
  
  if (!registration) {
    throw new Error('Registration not found')
  }
  
  // Check if already synced (idempotency check)
  if (registration.calendarSynced && registration.calendarEventId) {
    return registration.calendarEventId
  }
  
  // Check if user has connected calendar
  if (!registration.user.calendarConnected) {
    throw new Error('User has not connected Google Calendar')
  }
  
  // Get valid access token
  const accessToken = await getValidAccessToken(registration.userId)
  
  // Prepare event data
  const eventTitle = `❄️ Taakra: ${registration.competition.title}`
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/registrations`
  const eventDescription = `${registration.competition.description}\n\nView your registration: ${dashboardUrl}`
  
  const deadlineDate = new Date(registration.competition.deadline)
  const reminderDate = new Date(deadlineDate)
  reminderDate.setHours(reminderDate.getHours() - 24) // 24 hours before deadline
  
  const eventData = {
    summary: eventTitle,
    description: eventDescription,
    start: {
      dateTime: deadlineDate.toISOString(),
      timeZone: 'UTC',
    },
    end: {
      dateTime: new Date(deadlineDate.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
      timeZone: 'UTC',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 24 hours before
        { method: 'popup', minutes: 24 * 60 },
      ],
    },
  }
  
  // Create event via Google Calendar API
  const response = await fetch(`${CALENDAR_API_BASE}/calendars/primary/events`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create calendar event: ${error}`)
  }
  
  const event = await response.json()
  
  // Save event ID and mark as synced
  await prisma.competitionRegistration.update({
    where: { id: registrationId },
    data: {
      calendarEventId: event.id,
      calendarSynced: true,
    },
  })
  
  return event.id
}

/**
 * Attempts to sync a registration to calendar.
 * Returns success status and any error message.
 */
export async function syncRegistrationToCalendar(
  registrationId: number
): Promise<{ success: boolean; error?: string; eventId?: string }> {
  try {
    const eventId = await createCalendarEvent(registrationId)
    return { success: true, eventId }
  } catch (error: any) {
    console.error('Calendar sync error:', error)
    
    // Update registration to mark sync as failed (but don't block approval)
    await prisma.competitionRegistration.update({
      where: { id: registrationId },
      data: { calendarSynced: false },
    })
    
    return {
      success: false,
      error: error.message || 'Failed to sync to calendar',
    }
  }
}

/**
 * Disconnects a user's Google Calendar.
 * Removes stored refresh token.
 */
export async function disconnectCalendar(userId: number): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      googleRefreshToken: null,
      calendarConnected: false,
    },
  })
}

