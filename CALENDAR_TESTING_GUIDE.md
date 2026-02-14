# Google Calendar Integration Testing Guide

This guide will walk you through testing the Google Calendar integration step by step.

## Prerequisites

### 1. Environment Variables Setup

Add these to your `.env` file:

```bash
# Google OAuth Credentials (REQUIRED)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Optional: Custom redirect URI (defaults to /api/calendar/callback)
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/callback

# Encryption key for token storage (REQUIRED - must be at least 32 characters)
ENCRYPTION_KEY=your-secure-encryption-key-at-least-32-characters-long

# App URL (used for calendar event links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `libproject-90bd6`
3. Enable **Google Calendar API**:
   - Navigate to: **APIs & Services** → **Library**
   - Search for "Google Calendar API"
   - Click **Enable**

4. Create OAuth 2.0 Credentials:
   - Navigate to: **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `Taakra Calendar Integration`
   - Authorized redirect URIs:
     - `http://localhost:3000/api/calendar/callback` (for local testing)
     - `https://yourdomain.com/api/calendar/callback` (for production)
   - Click **Create**
   - Copy the **Client ID** and **Client Secret** to your `.env` file

### 3. Database Migration

Run the Prisma migration to add calendar fields:

```bash
# If using Docker
make prisma-migrate

# Or manually
pnpm prisma migrate dev --name add_calendar_integration

# Or if using Docker directly
docker-compose exec app pnpm prisma migrate dev
```

Verify the migration:
```bash
# Check Prisma Studio
make prisma-studio
# Or: docker-compose exec app pnpm prisma studio
```

You should see:
- `User` table has: `googleRefreshToken` and `calendarConnected`
- `CompetitionRegistration` table has: `calendarEventId` and `calendarSynced`

---

## Testing Flow

### Step 1: Start the Application

```bash
# Development mode
pnpm dev
# Or with Docker
make dev
```

Visit: `http://localhost:3000`

### Step 2: Create a Test User Account

1. Go to `/signup`
2. Create an account (email/password or OAuth)
3. Log in

### Step 3: Register for a Competition

1. Go to `/competitions`
2. Click on any competition
3. Fill out the registration form:
   - Full Name
   - Email
   - Transaction ID
   - Upload payment slip
4. Submit registration
5. Status should be: **Pending Approval**

### Step 4: Test Calendar Connection (Before Approval)

1. Go to `/registrations`
2. You should see a banner: **"Connect Google Calendar"**
3. Click **"Connect Calendar"**
4. You'll be redirected to Google OAuth consent screen
5. Sign in with any Google account (doesn't need to match your Taakra email)
6. Grant calendar permissions
7. You'll be redirected back to `/registrations?calendar_connected=true`
8. Success message should appear: **"Google Calendar connected successfully! ✅"**

**Verify:**
- Banner should disappear
- Check database: `User.calendarConnected` should be `true`
- Check database: `User.googleRefreshToken` should have encrypted value

### Step 5: Approve Registration (Admin)

1. Log in as admin
2. Go to `/admin/payments` or `/admin/registrations`
3. Find the test registration
4. Approve the payment
5. Registration status should change to **Approved**

**What happens automatically:**
- System checks if user has `calendarConnected = true`
- If yes, it attempts to create a calendar event
- Event is created in user's Google Calendar
- `calendarEventId` is saved to database
- `calendarSynced` is set to `true`

**Verify:**
- Check Google Calendar: Event should appear with title: **"❄️ Taakra: [Competition Name]"**
- Event should be set to competition deadline
- Reminder should be 24 hours before deadline
- Check database: `CompetitionRegistration.calendarEventId` should have a value
- Check database: `CompetitionRegistration.calendarSynced` should be `true`

### Step 6: Check Registration Dashboard

1. Log in as the user
2. Go to `/registrations`
3. Find the approved registration
4. Scroll to **"Google Calendar"** section
5. Should show: **"✅ Added to Google Calendar"**

### Step 7: Test Retry Functionality (Optional)

To test retry, you can manually set `calendarSynced = false` in database:

```sql
-- In Prisma Studio or direct SQL
UPDATE "CompetitionRegistration" 
SET "calendarSynced" = false 
WHERE id = <registration_id>;
```

Then:
1. Go to `/registrations`
2. Click **"Retry Calendar Sync"**
3. Should sync successfully and show success message

### Step 8: Test Idempotency

1. Approve another registration (or use existing)
2. System should NOT create duplicate events
3. Check: `calendarSynced = true` prevents duplicate creation

---

## Manual API Testing

### Test 1: Connect Calendar Endpoint

```bash
# Get auth token first (from browser cookies or login)
curl -X GET http://localhost:3000/api/calendar/connect \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

Expected response:
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

### Test 2: Calendar Sync Endpoint

```bash
curl -X POST http://localhost:3000/api/calendar/sync/1 \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

Expected response (success):
```json
{
  "message": "Successfully synced to calendar",
  "eventId": "abc123xyz..."
}
```

Expected response (error):
```json
{
  "error": "User has not connected Google Calendar"
}
```

---

## Verification Checklist

### Database Checks

```sql
-- Check user calendar connection
SELECT id, email, "calendarConnected", 
       CASE WHEN "googleRefreshToken" IS NOT NULL THEN 'encrypted' ELSE 'null' END as token_status
FROM "User"
WHERE email = 'your-test-email@example.com';

-- Check registration sync status
SELECT id, status, "paymentStatus", "calendarSynced", "calendarEventId"
FROM "CompetitionRegistration"
WHERE "userId" = <user_id>;
```

### Google Calendar Checks

1. Open Google Calendar
2. Look for event: **"❄️ Taakra: [Competition Name]"**
3. Verify:
   - Event date/time matches competition deadline
   - Description contains competition info and dashboard link
   - Reminder is set for 24 hours before

### UI Checks

1. **Not Connected State:**
   - Banner shows: "Connect Google Calendar"
   - Connect button is visible

2. **Connected State:**
   - Banner is hidden
   - Registration cards show calendar status

3. **Synced State:**
   - Shows: "✅ Added to Google Calendar"

4. **Failed State:**
   - Shows: "🔁 Calendar sync failed or pending"
   - "Retry Calendar Sync" button is visible

---

## Troubleshooting

### Issue: "Google OAuth credentials not configured"

**Solution:**
- Check `.env` file has `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Restart the server after adding env variables

### Issue: "No refresh token received"

**Solution:**
- Make sure `prompt: 'consent'` is in OAuth URL (already implemented)
- User must grant permission on consent screen
- If user already granted permission, revoke access in [Google Account Settings](https://myaccount.google.com/permissions) and try again

### Issue: Calendar event not created after approval

**Check:**
1. User has `calendarConnected = true`?
2. Registration is `status = 'approved'`?
3. Check server logs for errors
4. Verify Google Calendar API is enabled in Google Cloud Console

### Issue: "Failed to decrypt refresh token"

**Solution:**
- Check `ENCRYPTION_KEY` is set and at least 32 characters
- If key changed, user needs to reconnect calendar

### Issue: Redirect URI mismatch

**Error:** `redirect_uri_mismatch`

**Solution:**
- Check Google Cloud Console → Credentials → OAuth 2.0 Client
- Ensure redirect URI matches exactly: `http://localhost:3000/api/calendar/callback`
- No trailing slashes, exact match required

### Issue: Calendar API not enabled

**Error:** `Calendar API has not been used in project`

**Solution:**
- Enable Google Calendar API in Google Cloud Console
- Wait a few minutes for propagation

---

## Testing Different Scenarios

### Scenario 1: Email/Password User → Connect Calendar Later

1. Sign up with email/password
2. Register for competition
3. Connect Google Calendar (different Google account is OK)
4. Get approval
5. Event should be created automatically

### Scenario 2: OAuth User → Connect Calendar

1. Sign up with Google OAuth
2. Register for competition
3. Connect Google Calendar (can be same or different Google account)
4. Get approval
5. Event should be created automatically

### Scenario 3: User Not Connected → Approval First

1. Register for competition
2. Get approval (no calendar connected)
3. Connect Google Calendar
4. After connection, approved registrations should auto-sync
5. Check calendar for events

### Scenario 4: Multiple Registrations

1. Register for multiple competitions
2. Connect calendar
3. Approve all registrations
4. Each should create separate calendar event
5. Verify no duplicates

---

## Debugging Tips

### Enable Detailed Logging

Check server console for:
- OAuth flow logs
- Token refresh logs
- Calendar API responses
- Error messages

### Check Database State

```bash
# Open Prisma Studio
make prisma-studio

# Or direct SQL
docker-compose exec postgres psql -U postgres -d estatepro
```

### Test Calendar Service Directly

You can create a test script:

```typescript
// scripts/test-calendar.ts
import { syncRegistrationToCalendar } from '@/lib/calendar/googleCalendar.service'

async function test() {
  const result = await syncRegistrationToCalendar(1) // registration ID
  console.log(result)
}
```

---

## Success Criteria

✅ User can connect Google Calendar independently of login method  
✅ Calendar connection works for email/password users  
✅ Calendar connection works for OAuth users  
✅ Events are created automatically after approval (if connected)  
✅ Events appear in Google Calendar with correct details  
✅ Duplicate events are prevented  
✅ Retry functionality works  
✅ Calendar failures don't block registration approval  
✅ UI shows correct status at each stage  

---

## Next Steps After Testing

1. **Production Setup:**
   - Update `GOOGLE_REDIRECT_URI` to production domain
   - Update `NEXT_PUBLIC_APP_URL` to production domain
   - Add production redirect URI in Google Cloud Console

2. **Security:**
   - Ensure `ENCRYPTION_KEY` is strong and secure
   - Never commit `.env` file
   - Rotate keys periodically

3. **Monitoring:**
   - Set up error logging for calendar sync failures
   - Monitor calendar API quota usage
   - Track sync success rates

---

## Support

If you encounter issues:
1. Check server logs
2. Verify environment variables
3. Check Google Cloud Console settings
4. Verify database schema is up to date
5. Test with a fresh user account


