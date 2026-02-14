import { prisma } from './prisma'
import { pusherServer } from './pusher/server'

type ActivityAction =
  | 'property_created'
  | 'property_viewed'
  | 'property_updated'
  | 'property_deleted'
  | 'user_registered'
  | 'user_logged_in'
  | 'user_logged_out'
  | 'admin_login'
  | 'system_event'

type LogActivityParams = {
  action: ActivityAction
  entityType?: 'property' | 'user' | 'system'
  entityId?: number
  userId?: number
  metadata?: Record<string, any>
}

export async function logActivity({
  action,
  entityType,
  entityId,
  userId,
  metadata,
}: LogActivityParams) {
  try {
    await prisma.activityLog.create({
      data: {
        action,
        entityType: entityType ?? null,
        entityId: entityId ?? null,
        userId: userId ?? null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })
    await maybeNotifyAdmins({ action, entityType, entityId, userId, metadata })
  } catch (error) {
    // Don't throw - activity logging shouldn't break the app
    console.error('Failed to log activity:', error)
  }
}

// Notify a specific user about an event
export async function notifyUser({
  userId,
  title,
  message,
  type,
  entityType,
  entityId,
}: {
  userId: number
  title: string
  message: string
  type?: string
  entityType?: string
  entityId?: number
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: type ?? null,
        entityType: entityType ?? null,
        entityId: entityId ?? null,
      },
    })

    if (pusherServer) {
      await pusherServer.trigger(
        `user-notifications-${userId}`,
        'new-notification',
        { notification }
      )
    }

    return notification
  } catch (error) {
    console.error('Failed to notify user:', error)
  }
}

async function maybeNotifyAdmins({
  action,
  entityType,
  entityId,
  metadata,
}: LogActivityParams) {
  try {
    const shouldNotifyUserRegistered = action === 'user_registered'
    const isMeetingRequest =
      action === 'system_event' && metadata?.event === 'meeting_request_created'

    if (!shouldNotifyUserRegistered && !isMeetingRequest) return

    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true, email: true, name: true },
    })

    if (admins.length === 0) return

    const notificationPayload = buildNotificationPayload({
      action,
      entityType,
      entityId,
      metadata,
    })

    for (const admin of admins) {
      const notification = await prisma.notification.create({
        data: {
          ...notificationPayload,
          userId: admin.id,
        },
      })

      if (pusherServer) {
        await pusherServer.trigger('admin-notifications', 'new-notification', {
          notification,
        })
      }
    }
  } catch (error) {
    console.error('Failed to notify admins:', error)
  }
}

function buildNotificationPayload({
  action,
  entityType,
  entityId,
  metadata,
}: LogActivityParams) {
  if (action === 'user_registered') {
    const email = metadata?.email as string | undefined
    return {
      title: 'New user signed up',
      message: email ? `${email} just created an account.` : 'A new user signed up.',
      type: 'user_registered',
      entityType: entityType ?? 'user',
      entityId: entityId ?? null,
    }
  }

  const propertyTitle = metadata?.propertyTitle as string | undefined
  const requesterEmail = metadata?.email as string | undefined

  return {
    title: 'New meeting request',
    message: propertyTitle
      ? `${requesterEmail || 'A user'} requested a video call for ${propertyTitle}.`
      : `${requesterEmail || 'A user'} requested a video call.`,
    type: 'meeting_request',
    entityType: entityType ?? 'system',
    entityId: entityId ?? null,
  }
}
