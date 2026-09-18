'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const MOCK_PRODUCTS = [
  'Select Product...',
  'Sooper Biscuits 12x4',
  'Cafe Coffee 50g',
  'Chilli Mili 24x10',
  'Kolson Pasta 400g',
  'National Ketchup 800g',
  'Shan Biryani Masala 50g',
  'Lipton Yellow Label 380g',
  'Tapal Danedar 450g',
  'Pepsi 1.5L PET',
  'Aquafina 500ml',
]

interface ReturnItem {
  id: string
  name: string
  qty: string
  uom: 'CTN' | 'PCS'
  batch: string
  expiry: string
  photoAttached: boolean
}

function ReturnFormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const outletId = searchParams.get('id')

  const [outlet, setOutlet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [products, setProducts] = useState<ReturnItem[]>([])
  
  // Current Form State
  const [currentName, setCurrentName] = useState('')
  const [currentQty, setCurrentQty] = useState('')
  const [currentUom, setCurrentUom] = useState<'CTN' | 'PCS'>('CTN')
  const [currentBatch, setCurrentBatch] = useState('')
  const [currentExpiry, setCurrentExpiry] = useState('')
  const [currentPhoto, setCurrentPhoto] = useState(false)

  useEffect(() => {
    if (!outletId) {
      router.push('/')
      return
    }
    loadOutlet()
  }, [outletId])

  async function loadOutlet() {
    const { data } = await supabase
      .from('outlets')
      .select('*, routes(name)')
      .eq('id', outletId)
      .single()
    
    if (data) setOutlet(data)
    setLoading(false)
  }

  function handleAddProduct() {
    if (!currentName || currentName === 'Select Product...' || !currentQty || !currentExpiry) {
      alert('Please fill product name, quantity, and expiry date.')
      return
    }
    setProducts([...products, {
      id: Math.random().toString(36).substr(2, 9),
      name: currentName,
      qty: currentQty,
      uom: currentUom,
      batch: currentBatch,
      expiry: currentExpiry,
      photoAttached: currentPhoto
    }])
    
    // Reset Form
    setCurrentName('')
    setCurrentQty('')
    setCurrentUom('CTN')
    setCurrentBatch('')
    setCurrentExpiry('')
    setCurrentPhoto(false)
  }

  function removeProduct(id: string) {
    setProducts(products.filter(p => p.id !== id))
  }

  async function handleSubmit() {
    if (products.length === 0) {
      alert('Please add at least one product.')
      return
    }
    setSubmitting(true)
    
    const { data: { session } } = await supabase.auth.getSession()
    const todayISO = new Date().toISOString().slice(0, 10)
    const claimId = 'RTN-' + Math.floor(1000 + Math.random() * 9000)

    const totalCtn = products.filter(p => p.uom === 'CTN').reduce((a, b) => a + Number(b.qty), 0)
    const totalPcs = products.filter(p => p.uom === 'PCS').reduce((a, b) => a + Number(b.qty), 0)

    try {
      // Create Sales Return Record
      await supabase.from('sales_returns').insert({
        claim_id: claimId,
        outlet_id: outletId,
        order_booker_id: session?.user?.id || null,
        total_ctn: totalCtn,
        total_pcs: totalPcs,
        items: products,
      })

      // Update Visit Status directly to 'returned'
      if (session?.user?.id) {
        await supabase.from('outlet_visits').upsert({
          outlet_id: outletId,
          order_booker_id: session.user.id,
          visit_date: todayISO,
          status: 'returned',
          visited_at: new Date().toISOString(),
        }, { onConflict: 'outlet_id,visit_date' })
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err) {
      console.error(err)
      alert('Failed to submit claim. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <span className="material-symbols-outlined animate-spin text-slate-400 text-3xl">refresh</span>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-emerald-50 items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <span className="material-symbols-outlined text-5xl text-emerald-600">check_circle</span>
        </div>
        <h1 className="text-2xl font-extrabold text-emerald-900 mb-2">Expired Stock Claim Submitted</h1>
        <p className="text-emerald-700 font-medium">Claim ID successfully generated and saved.</p>
        <p className="text-sm text-emerald-600/70 mt-4">Redirecting back to routing...</p>
      </div>
    )
  }

  const totalCtn = products.filter(p => p.uom === 'CTN').reduce((a, b) => a + Number(b.qty), 0)
  const totalPcs = products.filter(p => p.uom === 'PCS').reduce((a, b) => a + Number(b.qty), 0)

  return (
    <div className="flex flex-col min-h-[100dvh] max-w-md mx-auto bg-slate-50">
      
      {/* Header */}
      <div className="bg-[#0f294a] text-white px-4 py-3 sticky top-0 z-20 shadow-md flex items-center gap-3">
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold">Expired Stock Claim</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32">
        
        {/* Outlet Info (Auto-filled) */}
        <div className="bg-white rounded-xl p-3 mb-4 shadow-sm border border-slate-200">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Outlet Details</div>
          <div className="font-extrabold text-slate-800 text-[15px] leading-tight">{outlet?.name}</div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">{outlet?.code} • Distributor: Main Dist.</div>
        </div>

        {/* Added Products List */}
        {products.length > 0 && (
          <div className="space-y-3 mb-4">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide px-1">Added Products ({products.length})</div>
            {products.map(p => (
              <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex justify-between items-start relative">
                <div>
                  <h4 className="font-bold text-[13px] text-slate-900">{p.name}</h4>
                  <div className="flex gap-4 mt-1.5 text-[11px] text-slate-600 font-medium">
                    <span>Qty: <strong className="text-slate-800">{p.qty} {p.uom}</strong></span>
                    <span>Expiry: <strong className="text-slate-800">{p.expiry}</strong></span>
                  </div>
                  {p.photoAttached && (
                    <div className="mt-2 text-[10px] font-bold text-blue-600 flex items-center gap-1 bg-blue-50 w-fit px-2 py-0.5 rounded">
                      <span className="material-symbols-outlined text-[13px]">photo_camera</span> Photo attached
                    </div>
                  )}
                </div>
                <button onClick={() => removeProduct(p.id)} className="text-red-400 hover:text-red-600 p-1 bg-red-50 rounded-lg">
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Product Form */}
        <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 relative">
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wide mb-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">add_circle</span> Add Return Item
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">SKU / Product Name</label>
              <select 
                value={currentName} 
                onChange={e => setCurrentName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none font-medium"
              >
                {MOCK_PRODUCTS.map(mp => <option key={mp} value={mp === 'Select Product...' ? '' : mp}>{mp}</option>)}
              </select>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Quantity</label>
                <input 
                  type="number" 
                  placeholder="0"
                  value={currentQty}
                  onChange={e => setCurrentQty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                />
              </div>
              <div className="flex-[0.7]">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">UOM</label>
                <select 
                  value={currentUom}
                  onChange={e => setCurrentUom(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold appearance-none"
                >
                  <option value="CTN">CTN</option>
                  <option value="PCS">PCS</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Expiry Date</label>
                <input 
                  type="date" 
                  value={currentExpiry}
                  onChange={e => setCurrentExpiry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Reason</label>
                <input 
                  type="text" 
                  value="Expired" 
                  disabled
                  className="w-full bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 font-bold text-center"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Batch No.</label>
              <input 
                type="text" 
                placeholder="Optional"
                value={currentBatch}
                onChange={e => setCurrentBatch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>

            <div className="pt-1">
              <button 
                onClick={() => setCurrentPhoto(!currentPhoto)}
                className={`w-full py-2.5 rounded-lg border border-dashed flex items-center justify-center gap-2 text-xs font-bold transition-colors ${currentPhoto ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'}`}
              >
                <span className="material-symbols-outlined text-[18px]">{currentPhoto ? 'check_circle' : 'add_a_photo'}</span>
                {currentPhoto ? 'Photo Attached' : 'Capture Photo Evidence'}
              </button>
            </div>

            <div className="pt-2">
              <button 
                onClick={handleAddProduct}
                className="w-full py-2.5 rounded-lg border-2 border-slate-200 bg-white text-slate-800 hover:bg-slate-50 flex items-center justify-center gap-1.5 text-xs font-extrabold transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">playlist_add</span>
                + Add Another Product
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30">
        
        {/* Bottom Summary */}
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between text-[11px] font-bold text-slate-700">
          <span>Total Products: <span className="text-blue-700">{products.length}</span></span>
          <span>Total CTN: <span className="text-blue-700">{totalCtn}</span></span>
          <span>Total PCS: <span className="text-blue-700">{totalPcs}</span></span>
        </div>
        
        <div className="p-3 flex gap-3">
          <button 
            disabled={submitting}
            className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-[13px] border border-slate-300 hover:bg-slate-200 transition-colors"
          >
            Save Draft
          </button>
          <button 
            onClick={handleSubmit}
            disabled={submitting || products.length === 0}
            className={`flex-1 py-3.5 rounded-xl font-bold text-[13px] shadow-md flex items-center justify-center gap-1.5 transition-colors ${products.length > 0 ? 'bg-[#0f294a] text-white hover:bg-blue-900' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
          >
            {submitting ? (
              <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
            ) : (
              <>Submit Claim <span className="material-symbols-outlined text-[18px]">send</span></>
            )}
          </button>
        </div>
      </div>

    </div>
  )
}

export default function ReturnPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-50"><span className="material-symbols-outlined animate-spin text-slate-400 text-3xl">refresh</span></div>}>
      <ReturnFormInner />
    </Suspense>
  )
}
