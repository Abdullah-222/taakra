import { Suspense } from 'react'
import MeetingPageClient from './MeetingPageClient'

export default function MeetingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="text-center space-y-4">
            <div className="text-lg font-semibold text-gray-700">Loading...</div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          </div>
        </div>
      }
    >
      <MeetingPageClient />
    </Suspense>
  )
}
