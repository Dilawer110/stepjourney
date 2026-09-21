'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OutletWithStatus, VisitStatus } from '@/lib/types'
import { openDirections } from '@/lib/geo'

const statusMap: Record<string, { label: string, color: string, note?: string }> = {
  remaining: { label: 'UN-BILLED • UNVISITED', color: 'text-slate-500' },
  visited: { label: 'UN-BILLED • VISITED', color: 'text-blue-600' },
  billed: { label: 'BILLED', color: 'text-emerald-600' },
  revisit_req: { label: 'REVISIT REQUIRED', color: 'text-amber-600', note: 'Purchaser unavailable • Revisit later today' },
  returned: { label: 'SALES RETURNED', color: 'text-orange-600' },
  closed: { label: 'CLOSED', color: 'text-rose-600' },
  shifted: { label: 'SHIFTED', color: 'text-purple-600' },
  not_found: { label: 'NOT FOUND', color: 'text-red-600' },
}

export default function OutletCard({ outlet, onSetStatus }: {
  outlet: OutletWithStatus
  onSetStatus: (id: string, status: VisitStatus | 'remaining') => void
}) {
  const [showMore, setShowMore] = useState(false)
  const router = useRouter()
  const currentStatus = statusMap[outlet.status] || statusMap.remaining

  return (
    <div className={`bg-white rounded-lg p-2.5 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] relative mb-2 last:mb-0 transition-all ${showMore ? 'z-40 ring-1 ring-blue-500' : 'z-10'}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-[13px] font-extrabold text-slate-900 leading-tight truncate">{outlet.name}</h3>
          <div className="text-[10px] font-medium text-slate-500 mt-0.5 truncate">
            {outlet.code} {outlet.sub_channel ? `• ${outlet.sub_channel}` : (outlet.channel ? `• ${outlet.channel}` : '')}
          </div>
          
          <div className="mt-1">
            <div className={`text-[10px] font-extrabold uppercase tracking-wide ${currentStatus.color}`}>
              {currentStatus.label} 
              {outlet.is_new && <span className="ml-1.5 px-1 py-[1px] bg-purple-100 text-purple-700 rounded text-[8px]">NEW</span>}
            </div>
            {currentStatus.note && (
              <div className="text-[9px] text-slate-400 font-medium leading-tight mt-0.5">
                {currentStatus.note}
              </div>
            )}
          </div>
        </div>
        
        <button 
          title="Navigation"
          onClick={() => openDirections(outlet.latitude, outlet.longitude)} 
          className="w-7 h-7 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full border border-blue-100 hover:bg-blue-100 flex-shrink-0 transition"
        >
          <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
        </button>
      </div>

      <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-100">
        <button title="Create Order" onClick={() => router.push(`/order?outletId=${outlet.id}&outletName=${encodeURIComponent(outlet.name)}&outletCode=${outlet.code}&pjp=${encodeURIComponent((outlet as any).routes?.name || '')}`)} className="w-8 h-8 flex items-center justify-center rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition">
          <span className="material-symbols-outlined text-[17px]">add_shopping_cart</span>
        </button>
        <button title="Sales Return" onClick={() => router.push(`/return/?id=${outlet.id}`)} className="w-8 h-8 flex items-center justify-center rounded-md bg-orange-50 text-orange-700 border border-orange-100 hover:bg-orange-100 transition">
          <span className="material-symbols-outlined text-[17px]">keyboard_return</span>
        </button>
        <button title="Survey" onClick={() => router.push(`/outlet/?id=${outlet.id}`)} className="w-8 h-8 flex items-center justify-center rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition">
          <span className="material-symbols-outlined text-[17px]">fact_check</span>
        </button>
        <button title="QC / Complaint" onClick={() => router.push(`/outlet/?id=${outlet.id}`)} className="w-8 h-8 flex items-center justify-center rounded-md bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 transition">
          <span className="material-symbols-outlined text-[17px]">feedback</span>
        </button>
        <button title="No Order / Visited" onClick={() => onSetStatus(outlet.id, 'visited')} className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition">
          <span className="material-symbols-outlined text-[17px]">block</span>
        </button>
        <button title="More" onClick={() => setShowMore(!showMore)} className={`w-8 h-8 flex items-center justify-center rounded-md border transition ${showMore ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}>
          <span className="material-symbols-outlined text-[17px]">more_vert</span>
        </button>
      </div>

      {showMore && (
        <div className="absolute right-2 top-[85%] mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 w-44 overflow-hidden divide-y divide-slate-100">
          <button onClick={() => { onSetStatus(outlet.id, 'revisit_req'); setShowMore(false) }} className="block w-full text-left px-3 py-2 text-[11px] text-amber-700 hover:bg-amber-50 font-bold transition">
            Mark Revisit Required
          </button>
          {(['not_found', 'closed', 'shifted'] as VisitStatus[]).map(s => (
            <button key={s}
              onClick={() => { onSetStatus(outlet.id, s); setShowMore(false) }}
              className="block w-full text-left px-3 py-2 text-[11px] text-slate-700 hover:bg-slate-50 font-medium transition"
            >
              Mark {s === 'not_found' ? 'Not Found' : s === 'closed' ? 'Permanently Closed' : 'Shifted'}
            </button>
          ))}
          <button
            onClick={() => { onSetStatus(outlet.id, 'remaining'); setShowMore(false) }}
            className="block w-full text-left px-3 py-2 text-[11px] text-blue-600 hover:bg-blue-50 font-medium transition"
          >
            Reset Status
          </button>
        </div>
      )}
    </div>
  )
}
