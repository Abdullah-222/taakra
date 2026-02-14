/**
 * Creates or updates the admin user from ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME in .env.
 * Run: pnpm run seed:admin
 */

import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma'

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME ?? 'Admin'

  if (!email?.trim()) {
    console.error('Missing ADMIN_EMAIL in .env')
    process.exit(1)
  }
  if (!password?.trim()) {
    console.error('Missing ADMIN_PASSWORD in .env')
    process.exit(1)
  }

  if (password.length < 6) {
    console.error('ADMIN_PASSWORD must be at least 6 characters')
    process.exit(1)
  }

  const trimmedEmail = email.trim().toLowerCase()

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    // Use upsert for atomic create/update (works better with serverless DBs like Neon)
    const existing = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    })

    if (existing) {
      await prisma.user.update({
        where: { email: trimmedEmail },
        data: {
          password: hashedPassword,
          name: name.trim() || existing.name,
          role: 'admin',
        },
      })
      console.log(`✅ Admin updated: ${trimmedEmail} (role set to admin, password updated)`)
    } else {
      await prisma.user.create({
        data: {
          email: trimmedEmail,
          name: name.trim() || null,
          password: hashedPassword,
          role: 'admin',
        },
      })
      console.log(`✅ Admin created: ${trimmedEmail}`)
    }
  } catch (e) {
    console.error('Seed failed:', e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
