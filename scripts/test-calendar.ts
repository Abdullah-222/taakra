/**
 * Quick test script to verify Google Calendar integration setup
 * 
 * Usage: pnpm tsx scripts/test-calendar.ts
 */

import { prisma } from '../src/lib/prisma'
import { getAuthorizationUrl } from '../src/lib/calendar/googleCalendar.service'

async function testCalendarSetup() {
  console.log('🔍 Testing Google Calendar Integration Setup...\n')

  // Check environment variables
  console.log('1. Checking environment variables...')
  const hasClientId = !!process.env.GOOGLE_CLIENT_ID
  const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET
  const hasEncryptionKey = !!process.env.ENCRYPTION_KEY
  const encryptionKeyLength = process.env.ENCRYPTION_KEY?.length || 0

  console.log(`   GOOGLE_CLIENT_ID: ${hasClientId ? '✅ Set' : '❌ Missing'}`)
  console.log(`   GOOGLE_CLIENT_SECRET: ${hasClientSecret ? '✅ Set' : '❌ Missing'}`)
  console.log(`   ENCRYPTION_KEY: ${hasEncryptionKey ? '✅ Set' : '❌ Missing'}`)
  if (hasEncryptionKey) {
    console.log(`   ENCRYPTION_KEY length: ${encryptionKeyLength} ${encryptionKeyLength >= 32 ? '✅' : '❌ (must be at least 32 characters)'}`)
  }
  console.log(`   NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL || 'Using default (localhost:3000)'}`)

  if (!hasClientId || !hasClientSecret || !hasEncryptionKey || encryptionKeyLength < 32) {
    console.log('\n❌ Missing required environment variables. Please check your .env file.')
    return
  }

  // Test OAuth URL generation
  console.log('\n2. Testing OAuth URL generation...')
  try {
    const authUrl = getAuthorizationUrl('test-state')
    console.log('   ✅ OAuth URL generated successfully')
    console.log(`   URL: ${authUrl.substring(0, 80)}...`)
  } catch (error: any) {
    console.log(`   ❌ Failed to generate OAuth URL: ${error.message}`)
    return
  }

  // Check database schema
  console.log('\n3. Checking database schema...')
  try {
    // Check User model
    const userSample = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        calendarConnected: true,
        googleRefreshToken: true,
      },
    })

    if (userSample) {
      console.log('   ✅ User model accessible')
      console.log(`   Sample user: ${userSample.email}`)
      console.log(`   Calendar connected: ${userSample.calendarConnected ? 'Yes' : 'No'}`)
      console.log(`   Has refresh token: ${userSample.googleRefreshToken ? 'Yes (encrypted)' : 'No'}`)
    } else {
      console.log('   ⚠️  No users found in database')
    }

    // Check CompetitionRegistration model
    const registrationSample = await prisma.competitionRegistration.findFirst({
      select: {
        id: true,
        status: true,
        calendarSynced: true,
        calendarEventId: true,
      },
    })

    if (registrationSample) {
      console.log('   ✅ CompetitionRegistration model accessible')
      console.log(`   Sample registration ID: ${registrationSample.id}`)
      console.log(`   Status: ${registrationSample.status}`)
      console.log(`   Calendar synced: ${registrationSample.calendarSynced ? 'Yes' : 'No'}`)
      console.log(`   Has event ID: ${registrationSample.calendarEventId ? 'Yes' : 'No'}`)
    } else {
      console.log('   ⚠️  No registrations found in database')
    }
  } catch (error: any) {
    console.log(`   ❌ Database check failed: ${error.message}`)
    console.log('   Make sure you have run: pnpm prisma migrate dev')
    return
  }

  // Check for users with calendar connected
  console.log('\n4. Checking calendar connections...')
  try {
    const connectedUsers = await prisma.user.count({
      where: { calendarConnected: true },
    })
    const totalUsers = await prisma.user.count()

    console.log(`   Total users: ${totalUsers}`)
    console.log(`   Users with calendar connected: ${connectedUsers}`)

    if (connectedUsers > 0) {
      const syncedRegistrations = await prisma.competitionRegistration.count({
        where: {
          calendarSynced: true,
          status: 'approved',
        },
      })
      console.log(`   Approved registrations synced to calendar: ${syncedRegistrations}`)
    }
  } catch (error: any) {
    console.log(`   ⚠️  Could not check connections: ${error.message}`)
  }

  console.log('\n✅ Setup check complete!')
  console.log('\nNext steps:')
  console.log('1. Make sure Google Calendar API is enabled in Google Cloud Console')
  console.log('2. Add redirect URI to OAuth credentials: http://localhost:3000/api/calendar/callback')
  console.log('3. Start the app: pnpm dev')
  console.log('4. Test the flow: Sign up → Register → Connect Calendar → Get Approval')
}

testCalendarSetup()
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


