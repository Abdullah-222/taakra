import Groq from 'groq-sdk'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

if (!GROQ_API_KEY) {
  console.warn('GROQ_API_KEY not set - AI features will be disabled')
}

// Initialize Groq client
const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null

// System prompt for Taakra Snow Assistant
const SYSTEM_PROMPT = `You are Taakra Snow Assistant.

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
* Never mention internal model names (like Llama or Groq)
* Never expose internal logic

Tone:
Friendly startup assistant.`

// Rate limiting: max requests per user per minute
const RATE_LIMIT_REQUESTS = 10
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute

// Max prompt length
const MAX_PROMPT_LENGTH = 2000

// Rate limit tracking (in-memory, per user)
const rateLimitMap = new Map<number, number[]>()

// Normalize prompt: trim, lowercase, collapse spaces
function normalizePrompt(prompt: string): string {
  return prompt
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

// Hash normalized prompt
function hashPrompt(normalizedPrompt: string): string {
  return crypto.createHash('sha256').update(normalizedPrompt).digest('hex')
}

// Check rate limit
function checkRateLimit(userId: number | null): boolean {
  if (!userId) {
    // Allow anonymous users but with stricter limits
    return true
  }

  const now = Date.now()
  const userRequests = rateLimitMap.get(userId) || []

  // Remove old requests outside the window
  const recentRequests = userRequests.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  )

  if (recentRequests.length >= RATE_LIMIT_REQUESTS) {
    return false
  }

  // Add current request
  recentRequests.push(now)
  rateLimitMap.set(userId, recentRequests)

  return true
}

// Get competition context for the AI
async function getCompetitionContext(): Promise<string> {
  try {
    const competitions = await prisma.competition.findMany({
      where: { status: 'published' },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        deadline: true,
        prize: true,
        tags: true,
      },
      orderBy: { deadline: 'asc' },
      take: 20, // Limit to recent/upcoming competitions
    })

    if (competitions.length === 0) {
      return 'No competitions are currently available.'
    }

    const context = competitions
      .map(
        (comp) =>
          `- ${comp.title} (${comp.category}): ${comp.description.substring(0, 100)}... Deadline: ${comp.deadline.toISOString().split('T')[0]}, Prize: ${comp.prize}`
      )
      .join('\n')

    return `Current competitions on Taakra:\n${context}`
  } catch (error) {
    console.error('Error fetching competition context:', error)
    return 'Unable to fetch current competitions.'
  }
}

export interface ChatResponse {
  success: boolean
  reply: string
  cached: boolean
  error?: string
}

/**
 * Main AI service function - SINGLE SOURCE OF TRUTH for Groq calls
 * Handles prompt normalization, hashing, caching, rate limiting, and Groq API calls
 */
export async function processChatMessage(
  prompt: string,
  userId: number | null = null
): Promise<ChatResponse> {
  // Validate input
  if (!prompt || prompt.trim().length === 0) {
    return {
      success: false,
      reply: 'Please provide a message.',
      cached: false,
      error: 'Empty prompt',
    }
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return {
      success: false,
      reply: `Message is too long. Maximum length is ${MAX_PROMPT_LENGTH} characters.`,
      cached: false,
      error: 'Prompt too long',
    }
  }

  // Check rate limit
  if (!checkRateLimit(userId)) {
    return {
      success: false,
      reply: 'You are sending messages too quickly. Please wait a moment.',
      cached: false,
      error: 'Rate limit exceeded',
    }
  }

  // Normalize and hash prompt
  const normalizedPrompt = normalizePrompt(prompt)
  const promptHash = hashPrompt(normalizedPrompt)

  try {
    // Check cache first
    const cached = await prisma.aiChatCache.findUnique({
      where: { promptHash },
    })

    if (cached) {
      // Increment usage count
      await prisma.aiChatCache.update({
        where: { id: cached.id },
        data: { usageCount: { increment: 1 } },
      })

      return {
        success: true,
        reply: cached.aiResponse,
        cached: true,
      }
    }

    // No cache hit - call Groq
    if (!groq) {
      return {
        success: false,
        reply: 'AI service is currently unavailable. Please try again later.',
        cached: false,
        error: 'Groq API not configured',
      }
    }

    // Get competition context
    const competitionContext = await getCompetitionContext()

    // Build messages for chat completion
    const messages = [
      {
        role: 'system' as const,
        content: `${SYSTEM_PROMPT}\n\n${competitionContext}`,
      },
      {
        role: 'user' as const,
        content: prompt,
      },
    ]

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages,
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 1024,
    })

    const aiResponse = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    // Store in cache
    await prisma.aiChatCache.create({
      data: {
        promptHash,
        originalPrompt: prompt,
        aiResponse,
        usageCount: 1,
        userId: userId || null,
      },
    })

    return {
      success: true,
      reply: aiResponse,
      cached: false,
    }
  } catch (error) {
    console.error('Error processing chat message:', error)
    return {
      success: false,
      reply: 'Sorry, I encountered an error. Please try again later.',
      cached: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
