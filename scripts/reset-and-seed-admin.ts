/**
 * Resets the database: deletes all users and all related data, then seeds the admin user.
 * Run: pnpm run db:reset
 *
 * Requires: ADMIN_EMAIL, ADMIN_PASSWORD (and optionally ADMIN_NAME) in .env
 */

import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma'

async function reset() {
  console.log('Resetting database (deleting all data in FK-safe order)...')

  await prisma.competitionRegistration.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.activityLog.deleteMany()
  await prisma.chatMessage.deleteMany()
  await prisma.meetingRequest.deleteMany()
  await prisma.property.deleteMany()
  await prisma.competition.deleteMany()
  await prisma.user.deleteMany()

  console.log('All users and related data removed.')
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim()
  const password = process.env.ADMIN_PASSWORD?.trim()
  const name = (process.env.ADMIN_NAME ?? 'Admin').trim()

  if (!email) {
    console.error('Missing ADMIN_EMAIL in .env')
    process.exit(1)
  }
  if (!password) {
    console.error('Missing ADMIN_PASSWORD in .env')
    process.exit(1)
  }
  if (password.length < 6) {
    console.error('ADMIN_PASSWORD must be at least 6 characters')
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name: name || null,
      password: hashedPassword,
      role: 'admin',
    },
  })
  console.log('Admin created:', email)
}

async function main() {
  try {
    await reset()
    await seedAdmin()
    console.log('Done. DB reset and admin seeded.')
  } catch (e) {
    console.error('Error:', e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
