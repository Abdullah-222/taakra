import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

const REPORT_TYPES = ['users', 'competitions', 'registrations', 'activity'] as const
type ReportType = (typeof REPORT_TYPES)[number]

export async function GET(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') as ReportType | null
  if (!type || !REPORT_TYPES.includes(type)) {
    return NextResponse.json(
      { error: 'Invalid report type. Use: users, competitions, registrations, activity' },
      { status: 400 }
    )
  }

  const date = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  let csv = ''
  let filename = ''

  try {
    if (type === 'users') {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          snowPoints: true,
          createdAt: true,
          updatedAt: true,
        },
      })
      const headers = ['ID', 'Email', 'Name', 'Role', 'Snow Points', 'Created At', 'Updated At']
      csv = [headers.join(','), ...users.map((u) =>
        [
          u.id,
          escapeCsvCell(u.email),
          escapeCsvCell(u.name),
          escapeCsvCell(u.role),
          u.snowPoints,
          new Date(u.createdAt).toISOString(),
          new Date(u.updatedAt).toISOString(),
        ].join(',')
      )].join('\n')
      filename = `taakra-users-${date}.csv`
    } else if (type === 'competitions') {
      const competitions = await prisma.competition.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { email: true, name: true } },
          _count: { select: { registrations: true } },
        },
      })
      const headers = ['ID', 'Title', 'Category', 'Status', 'Deadline', 'Prize', 'Registration Count', 'Created By', 'Created At']
      csv = [headers.join(','), ...competitions.map((c) =>
        [
          c.id,
          escapeCsvCell(c.title),
          escapeCsvCell(c.category),
          escapeCsvCell(c.status),
          new Date(c.deadline).toISOString(),
          escapeCsvCell(c.prize),
          c._count.registrations,
          escapeCsvCell(c.createdBy?.email ?? c.createdBy?.name ?? ''),
          new Date(c.createdAt).toISOString(),
        ].join(',')
      )].join('\n')
      filename = `taakra-competitions-${date}.csv`
    } else if (type === 'registrations') {
      const registrations = await prisma.competitionRegistration.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, name: true, snowPoints: true } },
          competition: { select: { id: true, title: true, category: true, deadline: true, prize: true, status: true } },
        },
      })
      const headers = [
        'Registration ID', 'User ID', 'User Email', 'User Name', 'User Snow Points',
        'Competition ID', 'Competition Title', 'Category', 'Deadline', 'Prize', 'Competition Status',
        'Status', 'Payment Status', 'Transaction ID', 'Rejection Reason', 'Created At',
      ]
      csv = [headers.join(','), ...registrations.map((r) =>
        [
          r.id,
          r.user.id,
          escapeCsvCell(r.user.email),
          escapeCsvCell(r.user.name),
          r.user.snowPoints,
          r.competition.id,
          escapeCsvCell(r.competition.title),
          escapeCsvCell(r.competition.category),
          new Date(r.competition.deadline).toISOString(),
          escapeCsvCell(r.competition.prize),
          escapeCsvCell(r.competition.status),
          escapeCsvCell(r.status),
          escapeCsvCell(r.paymentStatus),
          escapeCsvCell(r.transactionId),
          escapeCsvCell(r.rejectionReason),
          new Date(r.createdAt).toISOString(),
        ].join(',')
      )].join('\n')
      filename = `taakra-registrations-${date}.csv`
    } else if (type === 'activity') {
      const activities = await prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5000,
        include: {
          user: { select: { id: true, email: true, name: true } },
        },
      })
      const headers = ['ID', 'Action', 'Entity Type', 'Entity ID', 'User ID', 'User Email', 'User Name', 'Metadata', 'Created At']
      csv = [headers.join(','), ...activities.map((a) =>
        [
          a.id,
          escapeCsvCell(a.action),
          escapeCsvCell(a.entityType),
          a.entityId ?? '',
          a.userId ?? '',
          escapeCsvCell(a.user?.email),
          escapeCsvCell(a.user?.name),
          escapeCsvCell(a.metadata),
          new Date(a.createdAt).toISOString(),
        ].join(',')
      )].join('\n')
      filename = `taakra-activity-${date}.csv`
    }
  } catch (e) {
    console.error('Report generation error:', e)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
