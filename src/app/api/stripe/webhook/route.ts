import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

const webhookSecret = process.env.WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error('WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  try {
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')
    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
    }

    const rawBody = await request.text()
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      // Optional: log or sync payment (competition registration is completed on redirect)
      if (session.metadata?.competitionId) {
        console.log('[Stripe webhook] Checkout completed for competition', session.metadata.competitionId)
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err: any) {
    console.error('Stripe webhook error:', err?.message ?? err)
    return NextResponse.json(
      { error: err?.message ?? 'Webhook signature verification failed' },
      { status: 400 }
    )
  }
}
