'use client'

import { useState } from 'react'
import { MeetingRequestModal } from '@/components/property/MeetingRequestModal'

type PropertyDetailClientProps = {
  propertyId: number
  propertyTitle: string
}

export function PropertyDetailClient({ propertyId, propertyTitle }: PropertyDetailClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="surface-card p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
          Consultation
        </p>
        <h2 className="mt-2 text-base font-semibold tracking-tight">Interested in this property?</h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Request a video consultation and an admin will email your meeting link.
        </p>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn-primary mt-4 w-full px-4 py-2.5 text-sm"
        >
          Schedule Video Meeting
        </button>
      </div>

      <MeetingRequestModal
        propertyId={propertyId}
        propertyTitle={propertyTitle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
