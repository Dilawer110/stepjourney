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
  
  // App State
  const [outlet, setOutlet] = useState<any>(null)
  const [step, setStep] = useState(1)
  
  // Step 1 State
  const [category, setCategory] = useState('packaging')
  const [description, setDescription] = useState('')
  const [isHighPriority, setIsHighPriority] = useState(false)
  
  // Step 2 State
  const [mediaMode, setMediaMode] = useState<'audio' | 'video'>('audio')
  const [isRecording, setIsRecording] = useState(false)
  const [attachments, setAttachments] = useState<{name: string, type: string, size: string, duration?: string}[]>([
    { name: 'peanuts_seal_defect.mp4', type: 'video', size: '4.2 MB', duration: '0:24' } // Pre-filled mock data from design
  ])

  useEffect(() => {
    if (id) {
      supabase.from('outlets').select('*').eq('id', id).single().then(({ data }) => setOutlet(data))
    }
  }, [id])

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
    else alert('Submit to be implemented in Review step!')
  }
  
  const handleBack = () => {
    if (step > 1) setStep(step - 1)
    else router.back()
  }

  const simulateRecord = () => {
    if (isRecording) {
      setIsRecording(false)
      setAttachments([...attachments, { name: mediaMode === 'audio' ? 'voice_note_1.m4a' : 'video_evidence.mp4', type: mediaMode, size: '1.1 MB', duration: '0:10' }])
    } else {
      setIsRecording(true)
      setTimeout(() => setIsRecording(false), 2000) // Auto-stop after 2s for demo
    }
  }

  const removeAttachment = (idx: number) => {
    setAttachments(attachments.filter((_, i) => i !== idx))
  }

  if (!id) return <div className="p-6 text-center bg-slate-50 min-h-screen">No outlet selected</div>

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-slate-50 shadow-xl relative overflow-hidden">
      
      {/* Header (Dynamic based on step) */}
      <div className="bg-[#0f294a] text-white pt-6 px-4 pb-3 select-none flex flex-col sticky top-0 z-20 shadow-md">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <button onClick={handleBack} className="w-7 h-7 rounded-full bg-blue-900 flex items-center justify-center text-white hover:bg-blue-800 transition">
              <span className="material-symbols-outlined text-base">arrow_back</span>
            </button>
            <h2 className="text-sm font-bold text-white leading-tight">
              {step === 1 ? 'New Customer Feedback' : step === 2 ? 'Add Media (Optional)' : 'Review & Submit'}
            </h2>
          </div>
          <span className="text-[10px] text-blue-200 font-medium">Step {step} of 3</span>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-between text-[10px] font-semibold pt-1 pb-1 text-slate-300 transition-colors">
          <div className={`flex items-center gap-1 ${step >= 1 ? 'text-white font-bold' : ''} ${step > 1 ? 'text-emerald-400' : ''}`}>
            {step > 1 ? (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">✓</span>
            ) : (
              <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px]">1</span>
            )}
            <span>Details</span>
          </div>
          <span className="text-slate-500">→</span>
          <div className={`flex items-center gap-1 ${step >= 2 ? 'text-white font-bold' : 'text-slate-400 opacity-60'} ${step > 2 ? 'text-emerald-400' : ''}`}>
            {step > 2 ? (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">✓</span>
            ) : (
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>2</span>
            )}
            <span>Media</span>
          </div>
          <span className="text-slate-500">→</span>
          <div className={`flex items-center gap-1 ${step === 3 ? 'text-white font-bold' : 'text-slate-400 opacity-60'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${step === 3 ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>3</span>
            <span>Review</span>
          </div>
        </div>
      </div>

      {/* BODY AREA */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 no-scrollbar pb-6 relative">
        
        {/* STEP 1: DETAILS */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
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

            {/* Category Grid */}
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
                        <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] shadow-sm">✓</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Description */}
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

            {/* Priority Flag */}
            <div 
              onClick={() => setIsHighPriority(!isHighPriority)}
              className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-lg transition-colors ${isHighPriority ? 'text-amber-500' : 'text-slate-400'}`}>flag</span>
                <span className="text-[11px] font-semibold text-slate-700">High Priority Ticket</span>
              </div>
              <div className={`w-10 h-5.5 rounded-full flex items-center p-0.5 transition-colors duration-300 ${isHighPriority ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'}`}>
                <span className="w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform"></span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: MEDIA */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            
            {/* Instruction Notice Card */}
            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-2.5 flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 text-base mt-0.5">info</span>
              <p className="text-[11px] text-blue-900 leading-snug">
                <strong className="font-bold">Record proof:</strong> Record a short audio or video (max 60 seconds) directly while in the shop to substantiate customer complaint.
              </p>
            </div>

            {/* Segmented Switcher */}
            <div className="bg-slate-200/80 p-1 rounded-xl flex items-center text-xs font-semibold text-slate-600">
              <button onClick={() => setMediaMode('audio')} className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${mediaMode === 'audio' ? 'bg-blue-600 text-white shadow-sm' : 'hover:text-slate-900'}`}>
                <span className="material-symbols-outlined text-sm">mic</span> Audio
              </button>
              <button onClick={() => setMediaMode('video')} className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${mediaMode === 'video' ? 'bg-blue-600 text-white shadow-sm' : 'hover:text-slate-900'}`}>
                <span className="material-symbols-outlined text-sm">videocam</span> Video
              </button>
            </div>

            {/* Recorder UI */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="relative flex items-center justify-center my-1">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-50 border-4 border-red-200 animate-pulse' : 'bg-blue-50 border-4 border-blue-200'}`}>
                  <button onClick={simulateRecord} className={`w-14 h-14 rounded-full text-white flex items-center justify-center shadow-lg transition-colors ${isRecording ? 'bg-red-600 shadow-red-500/30' : 'bg-blue-600 shadow-blue-500/30'}`}>
                    <span className="material-symbols-outlined text-2xl">{isRecording ? 'stop' : (mediaMode === 'audio' ? 'mic' : 'videocam')}</span>
                  </button>
                </div>
              </div>
              <div className="mt-2 text-sm font-bold text-slate-800 tracking-wider">
                {isRecording ? '00:02 / 01:00' : '00:00 / 01:00'}
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {isRecording ? 'Recording in progress...' : `Tap to record ${mediaMode} feedback`}
              </p>
            </div>

            {/* Attachments List */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-bold text-slate-800">Captured Attachments ({attachments.length})</label>
                <span className="text-[10px] text-emerald-600 font-semibold">Ready</span>
              </div>
              
              <div className="space-y-2">
                {attachments.map((att, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-2 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2.5">
                      {/* Thumbnail */}
                      <div className="w-14 h-11 rounded-lg bg-slate-900 relative flex items-center justify-center overflow-hidden border border-slate-300">
                        {att.type === 'video' && <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/80 to-amber-600/80"></div>}
                        <span className="material-symbols-outlined text-white text-base z-10">{att.type === 'video' ? 'play_circle' : 'graphic_eq'}</span>
                        <span className="absolute bottom-0.5 right-1 text-[8px] font-bold text-white bg-black/70 px-1 rounded">{att.duration}</span>
                      </div>
                      {/* Info */}
                      <div>
                        <div className="text-[11px] font-bold text-slate-800 truncate max-w-[140px]">{att.name}</div>
                        <div className="text-[9px] text-slate-400 capitalize">{att.type} Evidence • {att.size}</div>
                      </div>
                    </div>
                    {/* Delete */}
                    <button onClick={() => removeAttachment(idx)} className="w-7 h-7 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition">
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                ))}
                {attachments.length === 0 && (
                  <div className="text-center text-slate-400 text-xs py-2">No attachments yet.</div>
                )}
              </div>
            </div>

            {/* Add Photo Button */}
            <button className="w-full bg-white border border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-2.5 flex items-center justify-center gap-2 text-slate-600 text-xs font-semibold transition">
              <span className="material-symbols-outlined text-blue-600 text-base">add_a_photo</span>
              <span>Add Photo (Optional)</span>
            </button>
          </div>
        )}

        {/* STEP 3: REVIEW (Placeholder) */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center h-48 space-y-3 animate-in fade-in duration-300">
            <span className="material-symbols-outlined text-4xl text-slate-300">fact_check</span>
            <p className="text-sm font-bold text-slate-600">Review & Submit</p>
            <p className="text-xs text-slate-500">Coming up next...</p>
          </div>
        )}

      </div>

      {/* Sticky Bottom Actions */}
      <div className="bg-white border-t border-slate-200 p-3 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {step === 1 ? (
          <button onClick={handleNext} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-colors">
            <span>Next: Add Media</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleBack} className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back</span>
            </button>
            <button onClick={handleNext} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-blue-500/20 transition-colors">
              <span>{step === 2 ? 'Next: Review' : 'Submit Ticket'}</span>
              <span className="material-symbols-outlined text-sm">{step === 2 ? 'arrow_forward' : 'check_circle'}</span>
            </button>
          </div>
        )}
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
