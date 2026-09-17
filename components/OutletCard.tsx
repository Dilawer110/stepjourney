'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OutletWithStatus, VisitStatus } from '@/lib/types'
import { openDirections } from '@/lib/geo'

const statusMap: Record<string, { label: string, color: string }> = {
  remaining: { label: 'UNVISITED', color: 'bg-slate-100 text-slate-600 border-slate-300' },
  visited: { label: 'VISITED', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  billed: { label: 'BILLED', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  closed: { label: 'CLOSED', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  shifted: { label: 'SHIFTED', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  not_found: { label: 'NOT FOUND', color: 'bg-amber-50 text-amber-700 border-amber-200' },
}

export default function OutletCard({ outlet, onSetStatus, onSetAlternateName }: {
  outlet: OutletWithStatus
  onSetStatus: (id: string, status: VisitStatus | 'remaining') => void
  onSetAlternateName: (id: string, current: string | null) => void
}) {
  const [showMore, setShowMore] = useState(false)
  const router = useRouter()

  const currentStatus = statusMap[outlet.status] || statusMap.remaining

  return (
    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm relative">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-xs font-bold text-slate-900 truncate">{outlet.name}</h3>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border ${currentStatus.color}`}>
              {currentStatus.label}
            </span>
            {outlet.is_new && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                NEW
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 truncate mt-0.5">
            {outlet.channel} {outlet.sub_channel ? `• ${outlet.sub_channel}` : ''}
            {outlet.code ? ` • Code: ${outlet.code}` : ''}
            {outlet.alternate_name ? ` • Alt: ${outlet.alternate_name}` : ''}
          </p>
        </div>
        <button 
          onClick={() => openDirections(outlet.latitude, outlet.longitude)} 
          className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-[10px] font-semibold border border-blue-100 transition hover:bg-blue-100"
        >
          <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>near_me</span>
          Nav
        </button>
      </div>

      <div className="grid grid-cols-5 gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
        <button 
          onClick={() => onSetStatus(outlet.id, 'billed')} 
          className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[9px] font-semibold hover:bg-emerald-100 transition"
        >
          <span className="material-symbols-outlined text-[15px]">shopping_cart</span>
          <span>Order</span>
        </button>
        
        <button 
          onClick={() => onSetStatus(outlet.id, 'visited')} 
          className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[9px] font-semibold hover:bg-rose-100 transition"
        >
          <span className="material-symbols-outlined text-[15px]">cancel</span>
          <span>No Order</span>
        </button>
        
        <button 
          onClick={() => router.push(`/outlet/?id=${outlet.id}`)} 
          className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-[9px] font-semibold hover:bg-indigo-100 transition"
        >
          <span className="material-symbols-outlined text-[15px]">storefront</span>
          <span>Survey</span>
        </button>
        
        <button 
          onClick={() => onSetAlternateName(outlet.id, outlet.alternate_name)} 
          className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[9px] font-semibold hover:bg-amber-100 transition"
        >
          <span className="material-symbols-outlined text-[15px]">edit_note</span>
          <span>Alt Name</span>
        </button>
        
        <button 
          onClick={() => setShowMore(!showMore)} 
          className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-lg text-[9px] font-semibold transition border ${showMore ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
        >
          <span className="material-symbols-outlined text-[15px]">more_horiz</span>
          <span>More</span>
        </button>
      </div>

      {showMore && (
        <div className="absolute right-3 bottom-12 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 w-44 overflow-hidden divide-y divide-slate-100">
          {(['not_found', 'closed', 'shifted'] as VisitStatus[]).map(s => (
            <button key={s}
              onClick={() => { onSetStatus(outlet.id, s); setShowMore(false) }}
              className="block w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 font-medium transition"
            >
              Mark {s === 'not_found' ? 'Not Found' : s === 'closed' ? 'Permanently Closed' : 'Shifted'}
            </button>
          ))}
          <button
            onClick={() => { onSetStatus(outlet.id, 'remaining'); setShowMore(false) }}
            className="block w-full text-left px-4 py-2.5 text-xs text-blue-600 hover:bg-blue-50 font-medium transition"
          >
            Reset Status
          </button>
        </div>
      )}
    </div>
  )
}
