import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getCurrentUser } from '@/lib/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      amount,
      currency = 'usd',
      productName = 'Product',
      competitionId,
    } = body

    const origin = request.headers.get('origin') || 'http://localhost:3000'

    // Competition registration: success returns to competition page
    const isCompetitionCheckout = typeof competitionId === 'number' && competitionId > 0
    const successUrl = isCompetitionCheckout
      ? `${origin}/competitions/${competitionId}?stripe=success&session_id={CHECKOUT_SESSION_ID}`
      : `${origin}/?stripe=success&session_id={CHECKOUT_SESSION_ID}#checkout`
    const cancelUrl = isCompetitionCheckout
      ? `${origin}/competitions/${competitionId}?stripe=cancel`
      : `${origin}/?stripe=cancel#checkout`

    const amountNum = typeof amount === 'number' ? amount : parseFloat(amount)
    if (isNaN(amountNum) || amountNum < 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      )
    }

    const lineItems = amountNum > 0
      ? [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: productName,
              },
              unit_amount: Math.round(amountNum * 100),
            },
            quantity: 1,
          },
        ]
      : [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: productName,
                description: 'Registration (no charge)',
              },
              unit_amount: 0,
            },
            quantity: 1,
          },
        ]

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.email,
      metadata: {
        userId: user.id.toString(),
        userEmail: user.email,
        ...(isCompetitionCheckout && { competitionId: String(competitionId) }),
      },
    })

    return NextResponse.json(
      {
        sessionId: session.id,
        url: session.url,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

