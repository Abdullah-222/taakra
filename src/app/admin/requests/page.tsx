'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from '@/components/ui/ToasterProvider'

type MeetingRequest = {
  id: number
  propertyId: number
  email: string
  name: string | null
  message: string | null
  status: string
  roomId: string | null
  roomCode: string | null
  roomUrl: string | null
  createdAt: string
  property: {
    id: number
    title: string
    location: string
  }
  approvedBy: {
    id: number
    email: string
    name: string | null
  } | null
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<MeetingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    try {
      const res = await fetch('/api/admin/meeting-requests')
      const data = await res.json()
      if (res.ok) {
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(requestId: number, action: 'approve' | 'reject') {
    setProcessingId(requestId)
    try {
      const res = await fetch('/api/admin/meeting-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process request')
      }

      if (action === 'approve') {
        toast.success('Request approved! Room created and email sent.')
      } else {
        toast.success('Request rejected.')
      }

      fetchRequests()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Failed to process request')
    } finally {
      setProcessingId(null)
    }
  }

  function getStatusBadge(status: string) {
    const styles = {
      pending:
        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
      approved:
        'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400',
      rejected:
        'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
    }
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          styles[status as keyof typeof styles] || styles.pending
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-stone-600 dark:text-gray-400">Loading requests...</div>
        </div>
      </div>
    )
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending')
  const otherRequests = requests.filter((r) => r.status !== 'pending')

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white mb-1">
          Meeting Requests
        </h1>
        <p className="text-stone-600 dark:text-gray-400">
          Review and manage video meeting requests from property viewers.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 p-10 text-center">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">
            No meeting requests yet
          </h2>
          <p className="text-sm text-stone-600 dark:text-gray-400">
            Meeting requests from property detail pages will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingRequests.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">
                Pending Requests ({pendingRequests.length})
              </h2>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    processingId={processingId}
                    onAction={handleAction}
                    getStatusBadge={getStatusBadge}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}

          {otherRequests.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">
                Processed Requests ({otherRequests.length})
              </h2>
              <div className="space-y-4">
                {otherRequests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    processingId={processingId}
                    onAction={handleAction}
                    getStatusBadge={getStatusBadge}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RequestCard({
  request,
  processingId,
  onAction,
  getStatusBadge,
  formatDate,
}: {
  request: MeetingRequest
  processingId: number | null
  onAction: (id: number, action: 'approve' | 'reject') => void
  getStatusBadge: (status: string) => JSX.Element
  formatDate: (date: string) => string
}) {
  const isProcessing = processingId === request.id

  return (
    <div className="bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-white">
              {request.property.title}
            </h3>
            {getStatusBadge(request.status)}
          </div>
          <p className="text-sm text-stone-600 dark:text-gray-400 mb-1">
            📍 {request.property.location}
          </p>
          <p className="text-sm text-stone-600 dark:text-gray-400">
            📧 {request.email}
            {request.name && ` • ${request.name}`}
          </p>
          {request.message && (
            <p className="text-sm text-stone-700 dark:text-gray-300 mt-2 p-3 bg-stone-50 dark:bg-gray-900/50 rounded-lg">
              {request.message}
            </p>
          )}
          <p className="text-xs text-stone-500 dark:text-gray-500 mt-2">
            Requested: {formatDate(request.createdAt)}
          </p>
          {request.approvedBy && (
            <p className="text-xs text-stone-500 dark:text-gray-500">
              Processed by: {request.approvedBy.email}
            </p>
          )}
        </div>
      </div>

      {request.status === 'approved' && request.roomUrl && (
        <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-400 mb-2">
            Meeting Room Created
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={request.roomUrl}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <span>🎥</span>
              <span>Join Room</span>
            </Link>
            {request.roomId && (
              <span className="text-xs text-stone-600 dark:text-gray-400">
                Room ID: <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">{request.roomId}</code>
              </span>
            )}
            {request.roomCode && (
              <span className="text-xs text-stone-600 dark:text-gray-400">
                Code: <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">{request.roomCode}</code>
              </span>
            )}
          </div>
        </div>
      )}

      {request.status === 'pending' && (
        <div className="flex gap-3">
          <button
            onClick={() => onAction(request.id, 'approve')}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Approve & Create Room'}
          </button>
          <button
            onClick={() => onAction(request.id, 'reject')}
            disabled={isProcessing}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  )
}
