'use client'

import dynamic from 'next/dynamic'

// Lazy load TaakraChatWidget with no SSR
const TaakraChatWidget = dynamic(
  () => import('@/components/ai/TaakraChatWidget').then((mod) => ({ default: mod.TaakraChatWidget })),
  {
    ssr: false,
    loading: () => null, // Don't show loading state for chat widget
  }
)

export function TaakraChatWidgetLazy() {
  return <TaakraChatWidget />
}

