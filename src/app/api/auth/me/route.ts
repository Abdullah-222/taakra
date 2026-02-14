import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, setAuthCookie } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const tokenUser = await getCurrentUser()

  if (!tokenUser) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: tokenUser.id },
    select: { id: true, email: true, name: true, role: true, imageUrl: true },
  })

  if (!dbUser) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role ?? 'user',
      imageUrl: dbUser.imageUrl ?? null,
    },
  })
}

export async function PATCH(req: NextRequest) {
  const tokenUser = await getCurrentUser()
  if (!tokenUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { name, imageUrl } = body

  const data: { name?: string; imageUrl?: string | null } = {}
  if (typeof name === 'string') data.name = name.trim() || null
  if (imageUrl !== undefined) data.imageUrl = imageUrl === null || imageUrl === '' ? null : String(imageUrl)

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: 'Provide name and/or imageUrl to update' },
      { status: 400 }
    )
  }

  const updated = await prisma.user.update({
    where: { id: tokenUser.id },
    data,
    select: { id: true, email: true, name: true, role: true, imageUrl: true },
  })

  await setAuthCookie({
    id: updated.id,
    email: updated.email,
    name: updated.name ?? undefined,
    role: updated.role ?? 'user',
  })

  return NextResponse.json({
    user: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role ?? 'user',
      imageUrl: updated.imageUrl ?? null,
    },
  })
}

