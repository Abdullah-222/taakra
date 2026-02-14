import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function requireAdmin() {
  const current = await getCurrentUser()
  if (!current) return null
  const user = await prisma.user.findUnique({
    where: { id: current.id },
    select: { role: true },
  })
  if (!user || user.role !== 'admin') return null
  return current
}
