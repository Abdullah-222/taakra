import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const BUCKET = 'takra-bucket'
const PAYMENT_SLIP_PREFIX = 'payment-slips/'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: idParam } = await params
    const registrationId = parseInt(idParam)
    if (isNaN(registrationId)) {
      return NextResponse.json({ error: 'Invalid registration ID' }, { status: 400 })
    }

    // Verify registration belongs to user
    const registration = await prisma.competitionRegistration.findUnique({
      where: { id: registrationId },
      include: {
        competition: {
          select: {
            title: true,
          },
        },
      },
    })

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    if (registration.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Handle file upload
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file || !file.size) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    if (!['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'].includes(ext)) {
      return NextResponse.json(
        { error: 'Invalid file type. Use JPG, PNG, GIF, WebP or PDF.' },
        { status: 400 }
      )
    }

    const path = `${PAYMENT_SLIP_PREFIX}${registrationId}-${user.id}-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Payment slip upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload payment slip' },
        { status: 500 }
      )
    }

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)

    // Update registration with new payment slip URL
    const updatedRegistration = await prisma.competitionRegistration.update({
      where: { id: registrationId },
      data: {
        paymentSlipUrls: [...registration.paymentSlipUrls, publicUrl],
        paymentStatus: 'pending', // Reset to pending when new slip is uploaded
        rejectionReason: null, // Clear rejection reason
      },
      include: {
        competition: {
          select: {
            title: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Payment slip uploaded successfully',
      registration: updatedRegistration,
    })
  } catch (error: any) {
    console.error('Payment slip upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload payment slip' },
      { status: 500 }
    )
  }
}

