# Taakra AI Chatbot Setup Guide

## Overview

The Taakra Snow Assistant is a Gemini-powered AI chatbot integrated into the Taakra platform. It provides assistance to users about competitions, registration, deadlines, and platform features via REST API.

## Architecture

```
Client (React) → REST API → AI Service → Cache (PostgreSQL) → Gemini API
```

### Key Components

1. **AI Service** (`/src/lib/ai/ai.service.ts`)
   - Single source of truth for all Gemini API calls
   - Handles prompt normalization and hashing
   - Implements caching layer
   - Rate limiting per user
   - Competition context injection

2. **REST API Endpoint** (`/src/app/api/ai/chat/route.ts`)
   - POST endpoint for chat messages
   - Handles authentication via JWT cookies
   - Returns AI responses with caching status

3. **Frontend Widget** (`/src/components/ai/TaakraChatWidget.tsx`)
   - React component with fetch API
   - Typing indicators
   - Message history
   - Optimistic UI updates

4. **Database Schema** (`prisma/schema.prisma`)
   - `AiChatCache` table for response caching
   - Prevents duplicate Gemini API calls

## Environment Variables

Add to your `.env` file:

```bash
# Gemini API Key (required)
GEMINI_API_KEY=your_gemini_api_key_here

# Gemini Model (optional, defaults to models/gemini-1.5-flash)
# IMPORTANT: Must include "models/" prefix for v1 API
# Options: 
#   models/gemini-1.5-flash (faster, cheaper) - RECOMMENDED
#   models/gemini-1.5-pro (more capable, slower)
# Note: gemini-pro is deprecated. Always use v1 models with "models/" prefix
GEMINI_MODEL=models/gemini-1.5-flash

# Database URL (required)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/estatepro
```

## Database Setup

1. **Run Prisma migration:**
   ```bash
   pnpm prisma migrate dev --name add_ai_chat_cache
   ```

2. **Or generate Prisma client:**
   ```bash
   pnpm prisma generate
   ```

## Running the Server

The application uses standard Next.js API routes.

### Development

```bash
pnpm dev
```

This runs `next dev` which:
- Starts Next.js in development mode
- Serves API routes at `/api/*`
- Handles HTTP requests

### Production

```bash
pnpm build
pnpm start
```

## Features

### ✅ Implemented

- [x] REST API-based chat
- [x] Gemini API integration
- [x] Response caching (PostgreSQL)
- [x] Prompt normalization and hashing
- [x] Rate limiting (10 requests/minute per user)
- [x] Competition context injection
- [x] Typing indicators
- [x] User authentication via JWT
- [x] Taakra-themed UI with glassmorphism
- [x] Error handling and user feedback

### 🔄 Future Extensions

The AI service is designed to be extensible for:
- Recommendation engine
- Analytics insights
- Fraud detection
- Personalized competition suggestions

## System Prompt

The chatbot uses this system prompt:

```
You are Taakra Snow Assistant.

Taakra is a snowy-themed competition platform.

Your responsibilities:
* Help users discover competitions
* Explain registration and payment process
* Provide deadline reminders
* Suggest competitions based on interests
* Answer platform questions

Rules:
* Be concise
* Be professional
* Use ❄️ emoji lightly
* Never hallucinate competitions
* If unsure, ask user to check dashboard
* Never mention Gemini
* Never expose internal logic

Tone:
Friendly startup assistant.
```

## API Flow

1. **User sends message** → POST `/api/ai/chat` with `{ message: string }`
2. **Backend normalizes prompt** → trim, lowercase, collapse spaces
3. **Backend hashes prompt** → SHA-256 hash
4. **Check cache** → Query `ai_chat_cache` table
5. **If cached:**
   - Increment `usage_count`
   - Return cached response immediately
6. **If not cached:**
   - Fetch competition context from database
   - Call Gemini API with system prompt + context
   - Store response in cache
   - Return response
7. **Return response** → JSON with `{ success, reply, cached }`

## API Endpoint

### POST `/api/ai/chat`

**Request:**
```json
{
  "message": "What competitions are available?"
}
```

**Response:**
```json
{
  "success": true,
  "reply": "Here are some competitions...",
  "cached": false
}
```

**Error Response:**
```json
{
  "success": false,
  "reply": "Error message",
  "cached": false
}
```

## Rate Limiting

- **Limit:** 10 requests per minute per user
- **Window:** 60 seconds
- **Anonymous users:** Allowed but tracked separately
- **Enforcement:** In-memory tracking (per server instance)

## Caching Strategy

- **Key:** SHA-256 hash of normalized prompt
- **Storage:** PostgreSQL `ai_chat_cache` table
- **Benefits:**
  - Prevents duplicate API calls
  - Reduces costs
  - Faster response times
  - Tracks usage statistics

## Troubleshooting

### API Issues

1. **Check endpoint:** Ensure `/api/ai/chat` is accessible
2. **Check authentication:** JWT cookies are sent automatically
3. **Check CORS:** Should not be an issue with same-origin requests

### Gemini API Issues

1. **Check API key:** Ensure `GEMINI_API_KEY` is set in environment
2. **Check rate limits:** Gemini has its own rate limits
3. **Check logs:** Look for errors in server console

### Database Issues

1. **Run migrations:** Ensure `AiChatCache` table exists
2. **Check connection:** Verify `DATABASE_URL` is correct
3. **Check Prisma client:** Run `pnpm prisma generate`

## Security Considerations

- ✅ API key only in server environment
- ✅ JWT authentication for user identification
- ✅ Rate limiting to prevent abuse
- ✅ Input validation (max length, empty checks)
- ✅ SQL injection protection (Prisma ORM)

## Performance

- **Cached responses:** < 50ms
- **Gemini API calls:** 1-3 seconds
- **HTTP request latency:** < 100ms
- **Database queries:** < 20ms (indexed)

## Monitoring

Monitor these metrics:
- Cache hit rate
- Average response time
- Rate limit violations
- Gemini API errors
- API request count
