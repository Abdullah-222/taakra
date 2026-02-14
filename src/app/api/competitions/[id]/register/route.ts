import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { logActivity, notifyUser } from '@/lib/activity'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

const BUCKET = 'takra-bucket'
const PAYMENT_SLIP_PREFIX = 'payment-slips/'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login to register.' }, { status: 401 })
    }

    const { id: idParam } = await params
    const competitionId = parseInt(idParam)
    if (isNaN(competitionId)) {
      return NextResponse.json({ error: 'Invalid competition ID' }, { status: 400 })
    }

    const contentType = req.headers.get('content-type') || ''

    // --- Stripe completion (JSON body after successful Stripe Checkout) ---
    if (contentType.includes('application/json')) {
      const body = await req.json()
      const {
        paymentMethod,
        stripeSessionId,
        fullName,
        email,
        phone = '',
        address = '',
        city = '',
        state = '',
        zipCode = '',
        country = '',
        additionalInfo = '',
      } = body

      if (paymentMethod !== 'stripe' || !stripeSessionId || typeof stripeSessionId !== 'string') {
        return NextResponse.json({ error: 'Invalid request. Missing stripe session.' }, { status: 400 })
      }
      if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
        return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
      }
      if (!email || typeof email !== 'string' || email.trim() === '') {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 })
      }

      const session = await stripe.checkout.sessions.retrieve(stripeSessionId)
      if (session.payment_status !== 'paid') {
        return NextResponse.json({ error: 'Payment not completed. Please complete payment first.' }, { status: 400 })
      }
      const meta = session.metadata || {}
      if (String(meta.competitionId) !== String(competitionId) || String(meta.userId) !== String(user.id)) {
        return NextResponse.json({ error: 'Session does not match this competition or user.' }, { status: 400 })
      }

      const competition = await prisma.competition.findUnique({ where: { id: competitionId } })
      if (!competition) {
        return NextResponse.json({ error: 'Competition not found' }, { status: 404 })
      }
      if (competition.status !== 'published') {
        return NextResponse.json({ error: 'Competition is not available for registration' }, { status: 400 })
      }
      if (new Date(competition.deadline) < new Date()) {
        return NextResponse.json({ error: 'Registration deadline has passed' }, { status: 400 })
      }

      const existingRegistration = await prisma.competitionRegistration.findUnique({
        where: {
          competitionId_userId: { competitionId, userId: user.id },
        },
      })
      if (existingRegistration) {
        return NextResponse.json({ error: 'You have already registered for this competition' }, { status: 400 })
      }

      const registration = await prisma.competitionRegistration.create({
        data: {
          competitionId,
          userId: user.id,
          transactionId: session.id,
          status: 'approved',
          paymentStatus: 'approved',
          paymentSlipUrls: [],
        },
        include: {
          competition: { select: { title: true } },
        },
      })

      await prisma.competition.update({
        where: { id: competitionId },
        data: { registrationCount: { increment: 1 } },
      })

      const registrationMetadata = {
        fullName: (fullName as string).trim(),
        email: (email as string).trim(),
        phone: (phone as string)?.trim() || null,
        address: (address as string)?.trim() || null,
        city: (city as string)?.trim() || null,
        state: (state as string)?.trim() || null,
        zipCode: (zipCode as string)?.trim() || null,
        country: (country as string)?.trim() || null,
        additionalInfo: (additionalInfo as string)?.trim() || null,
      }

      await logActivity({
        action: 'competition_registered',
        entityType: 'competition',
        entityId: competitionId,
        userId: user.id,
        metadata: JSON.stringify({
          competitionTitle: competition.title,
          transactionId: session.id,
          paymentMethod: 'stripe',
          ...registrationMetadata,
        }),
      })

      await notifyUser({
        userId: user.id,
        title: 'Registration complete ❄️',
        message: `Your registration for "${competition.title}" is confirmed. Payment received via Stripe.`,
        type: 'competition_registered',
        entityType: 'competition',
        entityId: competitionId,
      })

      return NextResponse.json({
        message: 'Registration successful',
        registration: {
          id: registration.id,
          status: registration.status,
          paymentStatus: registration.paymentStatus,
          createdAt: registration.createdAt,
        },
      })
    }

    // --- Payment slip flow (FormData) ---
    const formData = await req.formData()
    const transactionId = formData.get('transactionId') as string
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const city = formData.get('city') as string
    const state = formData.get('state') as string
    const zipCode = formData.get('zipCode') as string
    const country = formData.get('country') as string
    const additionalInfo = formData.get('additionalInfo') as string
    const paymentSlip = formData.get('paymentSlip') as File | null

    // Validation
    if (!transactionId || typeof transactionId !== 'string' || transactionId.trim() === '') {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 })
    }

    if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!paymentSlip || !paymentSlip.size) {
      return NextResponse.json({ error: 'Payment slip is required' }, { status: 400 })
    }

    // Validate file type
    const ext = paymentSlip.name.split('.').pop()?.toLowerCase() || ''
    if (!['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'].includes(ext)) {
      return NextResponse.json(
        { error: 'Invalid file type. Use JPG, PNG, GIF, WebP or PDF.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (paymentSlip.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Check if competition exists and is published
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
    })

    if (!competition) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 })
    }

    if (competition.status !== 'published') {
      return NextResponse.json({ error: 'Competition is not available for registration' }, { status: 400 })
    }

    // Check if deadline has passed
    if (new Date(competition.deadline) < new Date()) {
      return NextResponse.json({ error: 'Registration deadline has passed' }, { status: 400 })
    }

    // Check for duplicate registration
    const existingRegistration = await prisma.competitionRegistration.findUnique({
      where: {
        competitionId_userId: {
          competitionId,
          userId: user.id,
        },
      },
    })

    if (existingRegistration) {
      return NextResponse.json({ error: 'You have already registered for this competition' }, { status: 400 })
    }

    // Upload payment slip to Supabase
    const slipPath = `${PAYMENT_SLIP_PREFIX}${competitionId}-${user.id}-${Date.now()}.${ext}`
    
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(slipPath, paymentSlip, {
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

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(slipPath)

    // Store additional form data in metadata (we can extend the schema later if needed)
    const registrationMetadata = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      city: city?.trim() || null,
      state: state?.trim() || null,
      zipCode: zipCode?.trim() || null,
      country: country?.trim() || null,
      additionalInfo: additionalInfo?.trim() || null,
    }

    // Create registration
    const registration = await prisma.competitionRegistration.create({
      data: {
        competitionId,
        userId: user.id,
        transactionId: transactionId.trim(),
        status: 'pending',
        paymentStatus: 'pending',
        paymentSlipUrls: [publicUrl],
      },
      include: {
        competition: {
          select: {
            title: true,
            deadline: true,
          },
        },
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    // Update competition registration count
    await prisma.competition.update({
      where: { id: competitionId },
      data: {
        registrationCount: {
          increment: 1,
        },
      },
    })

    // Log activity with metadata
    await logActivity({
      action: 'competition_registered',
      entityType: 'competition',
      entityId: competitionId,
      userId: user.id,
      metadata: JSON.stringify({
        competitionTitle: competition.title,
        transactionId: transactionId.trim(),
        ...registrationMetadata,
      }),
    })

    // Notify user
    await notifyUser({
      userId: user.id,
      title: 'Registration Pending ❄️',
      message: `Your registration for "${competition.title}" is pending. We will review your payment slip and notify you once approved.`,
      type: 'competition_registered',
      entityType: 'competition',
      entityId: competitionId,
    })

    return NextResponse.json({
      message: 'Registration successful',
      registration: {
        id: registration.id,
        status: registration.status,
        paymentStatus: registration.paymentStatus,
        createdAt: registration.createdAt,
      },
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'You have already registered for this competition' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to register for competition' },
      { status: 500 }
    )
  }
}
