import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { logActivity } from '@/lib/activity'

export async function POST() {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await logActivity({
      action: 'system_event',
      entityType: 'system',
      userId: admin.id,
      metadata: { event: 'report_page_viewed' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging report view:', error)
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    )
  }
}
