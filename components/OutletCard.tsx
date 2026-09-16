'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OutletWithStatus, VisitStatus } from '@/lib/types'
import { openDirections } from '@/lib/geo'

const statusStyle: Record<string, string> = {
  visited: 'bg-blue-100 text-blue-700',
  billed: 'bg-green-100 text-green-700',
  not_found: 'bg-orange-100 text-orange-700',
  closed: 'bg-red-100 text-red-700',
  shifted: 'bg-purple-100 text-purple-700',
  remaining: 'bg-gray-100 text-gray-500',
}

export default function OutletCard({ outlet, onSetStatus, onSetAlternateName }: {
  outlet: OutletWithStatus
  onSetStatus: (id: string, status: VisitStatus | 'remaining') => void
  onSetAlternateName: (id: string, current: string | null) => void
}) {
  const [showMore, setShowMore] = useState(false)
  const router = useRouter()

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-2 relative">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold">{outlet.name}</span>
            <button
              onClick={() => openDirections(outlet.latitude, outlet.longitude)}
              title="Navigate"
              className="text-blue-600 text-lg leading-none">
              📍
            </button>
          </div>
          {outlet.alternate_name && <div className="text-xs text-gray-500">Alt: {outlet.alternate_name}</div>}
          <div className="text-xs text-gray-500">Code: {outlet.code}</div>
          <div className="text-xs text-gray-500">{outlet.channel}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {outlet.is_new && <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">NEW</span>}
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusStyle[outlet.status]}`}>
            {outlet.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onSetStatus(outlet.id, outlet.status === 'visited' ? 'remaining' : 'visited')}
          className={`flex-1 py-2 rounded-lg font-semibold ${outlet.status === 'visited' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'}`}>
          Visited
        </button>
        <button
          onClick={() => onSetStatus(outlet.id, outlet.status === 'billed' ? 'remaining' : 'billed')}
          className={`flex-1 py-2 rounded-lg font-semibold ${outlet.status === 'billed' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700'}`}>
          Billed
        </button>
        <button onClick={() => setShowMore(v => !v)} className="px-3 py-2 rounded-lg bg-gray-100 font-semibold">
          More
        </button>
      </div>

      {showMore && (
        <div className="absolute right-4 top-full mt-1 bg-white border rounded-lg shadow-lg z-10 w-48">
          {(['not_found', 'closed', 'shifted'] as VisitStatus[]).map(s => (
            <button key={s}
              onClick={() => { onSetStatus(outlet.id, s); setShowMore(false) }}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50">
              {s === 'not_found' ? 'Not Found' : s === 'closed' ? 'Permanently Closed' : 'Shifted'}
            </button>
          ))}
          <button
            onClick={() => { onSetAlternateName(outlet.id, outlet.alternate_name); setShowMore(false) }}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-t">
            Alternate Name
          </button>
          <button
            onClick={() => router.push(`/outlet/?id=${outlet.id}`)}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-t">
            Display Assets
          </button>
        </div>
      )}
    </div>
  )
}
