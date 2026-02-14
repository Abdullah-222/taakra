'use client'

import { Toaster, toast } from 'sonner'

export function ToasterProvider() {
  return (
    <>
      <Toaster richColors position="top-right" />
    </>
  )
}

export { toast }

