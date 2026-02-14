import crypto from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose"

import { prisma } from "@/lib/prisma"
import { hashPassword, setAuthCookie } from "@/lib/auth"
import { logActivity, notifyUser } from "@/lib/activity"

const FIREBASE_PROJECT_ID = "libproject-90bd6"
const FIREBASE_ISSUER = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
)

type FirebaseIdTokenPayload = JWTPayload & {
  email?: string
  email_verified?: boolean
  name?: string
  picture?: string
}

async function verifyFirebaseIdToken(idToken: string): Promise<FirebaseIdTokenPayload> {
  const { payload } = await jwtVerify(idToken, FIREBASE_JWKS, {
    issuer: FIREBASE_ISSUER,
    audience: FIREBASE_PROJECT_ID,
  })
  return payload as FirebaseIdTokenPayload
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const idToken = body?.idToken

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Google token is required" }, { status: 400 })
    }

    const payload = await verifyFirebaseIdToken(idToken)
    const email = payload.email?.trim().toLowerCase()
    const name = payload.name?.trim() || null
    const imageUrl = payload.picture?.trim() || null

    if (!email) {
      return NextResponse.json({ error: "Google account email is missing" }, { status: 400 })
    }

    if (payload.email_verified !== true) {
      return NextResponse.json({ error: "Google email is not verified" }, { status: 401 })
    }

    let isNewUser = false
    const existing = await prisma.user.findUnique({ where: { email } })

    let user = null
    if (existing) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: name ?? existing.name,
          imageUrl: imageUrl ?? existing.imageUrl,
        },
      })
    } else {
      isNewUser = true
      const userCount = await prisma.user.count()
      const role = userCount === 0 ? "admin" : "user"

      user = await prisma.user.create({
        data: {
          email,
          name,
          imageUrl,
          role,
          // Required by schema; random hash ensures no plaintext password is stored.
          password: await hashPassword(crypto.randomUUID()),
        },
      })
    }

    await setAuthCookie({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role ?? "user",
    })

    if (isNewUser) {
      await logActivity({
        action: "user_registered",
        entityType: "user",
        entityId: user.id,
        userId: user.id,
        metadata: { method: "google", email: user.email, role: user.role },
      })
    }

    await logActivity({
      action: user.role === "admin" ? "admin_login" : "user_logged_in",
      entityType: "user",
      entityId: user.id,
      userId: user.id,
      metadata: { method: "google", email: user.email },
    })

    // Send login notification to user
    const now = new Date()
    await notifyUser({
      userId: user.id,
      title: 'Welcome back!',
      message: `You signed in via Google at ${now.toLocaleString()}`,
      type: 'user_logged_in',
      entityType: 'user',
      entityId: user.id,
    })

    return NextResponse.json(
      {
        message: "Google login successful",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          imageUrl: user.imageUrl,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Google login error:", error)
    return NextResponse.json({ error: "Google sign-in failed" }, { status: 500 })
  }
}
