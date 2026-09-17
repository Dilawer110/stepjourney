'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const CATEGORIES = [
  { id: 'packaging', label: 'Packaging', icon: 'inventory_2' },
  { id: 'quality', label: 'Quality', icon: 'verified' },
  { id: 'freshness', label: 'Freshness', icon: 'eco' },
  { id: 'taste', label: 'Taste', icon: 'restaurant' },
  { id: 'salesman', label: 'Salesman', icon: 'badge' },
  { id: 'frequency', label: 'Frequency', icon: 'event_repeat' },
  { id: 'pricing', label: 'Pricing', icon: 'payments' },
  { id: 'other', label: 'Other', icon: 'more_horiz' },
]

function FeedbackFormInner() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || ''
  const router = useRouter()
  
  const [outlet, setOutlet] = useState<any>(null)
  const [category, setCategory] = useState('packaging')
  const [description, setDescription] = useState('')
  const [isHighPriority, setIsHighPriority] = useState(false)

  useEffect(() => {
    if (id) {
      supabase.from('outlets').select('*').eq('id', id).single().then(({ data }) => setOutlet(data))
    }
  }, [id])

  const handleNext = () => {
    // Save to localStorage or state to pass to Step 2
    alert('Progress saved! Next Step: Add Media (Coming Next)')
  }

  if (!id) return <div className="p-6 text-center bg-slate-50 min-h-screen">No outlet selected</div>

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-slate-50 shadow-xl relative overflow-hidden">
      
      {/* Status Bar & Header */}
      <div className="bg-[#0f294a] text-white pt-6 px-4 pb-3 select-none flex flex-col sticky top-0 z-20 shadow-md">
        
        {/* Header with Back */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="w-7 h-7 rounded-full bg-blue-900 flex items-center justify-center text-white hover:bg-blue-800 transition">
              <span className="material-symbols-outlined text-base">arrow_back</span>
            </button>
            <h2 className="text-sm font-bold text-white leading-tight">New Customer Feedback</h2>
          </div>
          <span className="text-[10px] text-blue-200 font-medium">Step 1 of 3</span>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-between text-[10px] font-semibold pt-1 pb-1 text-slate-300">
          <div className="flex items-center gap-1 text-white font-bold">
            <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px]">1</span>
            <span>Details</span>
          </div>
          <span className="text-slate-500">→</span>
          <div className="flex items-center gap-1 text-slate-400 opacity-60">
            <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[9px]">2</span>
            <span>Media</span>
          </div>
          <span className="text-slate-500">→</span>
          <div className="flex items-center gap-1 text-slate-400 opacity-60">
            <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[9px]">3</span>
            <span>Review</span>
          </div>
        </div>
      </div>

      {/* Form Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 no-scrollbar pb-6">

        {/* Auto-filled Outlet Card */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <span className="material-symbols-outlined text-base">storefront</span>
            </div>
            <div>
              <div className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">Target Outlet (Auto-Locked)</div>
              <div className="text-xs font-bold text-slate-900">{outlet ? outlet.name : 'Loading...'}</div>
              <div className="text-[10px] text-slate-500">{outlet ? `${outlet.channel} • Code: ${outlet.code}` : '...'}</div>
            </div>
          </div>
          <span className="material-symbols-outlined text-blue-600 text-base">lock</span>
        </div>

        {/* Category Selectable Cards Grid */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[11px] font-bold text-slate-800">Category <span className="text-red-500">*</span></label>
            <span className="text-[10px] text-slate-500">Select primary issue</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(c => {
              const isSelected = category === c.id;
              return (
                <div 
                  key={c.id} 
                  onClick={() => setCategory(c.id)} 
                  className={`border-2 rounded-xl p-2 flex flex-col items-center justify-center text-center relative cursor-pointer transition-all duration-200 ${
                    isSelected ? 'bg-blue-50/50 border-blue-600 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                    <span className="material-symbols-outlined text-sm">{c.icon}</span>
                  </div>
                  <span className={`text-[10px] leading-tight ${isSelected ? 'font-bold text-blue-900' : 'font-medium text-slate-700'}`}>{c.label}</span>
                  {isSelected && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] shadow-sm">
                      ✓
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Description Field */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[11px] font-bold text-slate-800">Description <span className="text-red-500">*</span></label>
            <span className="text-[10px] text-slate-400">{description.length}/500 chars</span>
          </div>
          <textarea 
            rows={3} 
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 leading-relaxed resize-none shadow-sm placeholder:text-slate-400" 
            placeholder="Enter customer feedback or complaint..."
          />
        </div>

        {/* Priority / Urgency Flag */}
        <div 
          onClick={() => setIsHighPriority(!isHighPriority)}
          className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined text-lg transition-colors ${isHighPriority ? 'text-amber-500' : 'text-slate-400'}`}>
              flag
            </span>
            <span className="text-[11px] font-semibold text-slate-700">High Priority Ticket</span>
          </div>
          <div className={`w-10 h-5.5 rounded-full flex items-center p-0.5 transition-colors duration-300 ${isHighPriority ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'}`}>
            <span className="w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform"></span>
          </div>
        </div>

      </div>

      {/* Sticky Bottom Action */}
      <div className="bg-white border-t border-slate-200 p-3 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={handleNext}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-colors"
        >
          <span>Next: Add Media</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
      
    </div>
  )
}

export default function OutletDetail() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-50"><span className="material-symbols-outlined animate-spin text-slate-400 text-3xl">refresh</span></div>}>
      <FeedbackFormInner />
    </Suspense>
  )
}
