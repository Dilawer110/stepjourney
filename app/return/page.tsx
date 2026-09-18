'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Product {
  code: string
  name: string
  gm: number
  pcsPerCtn: number
  retailPrice: number
  tp: number
}

const PRODUCTS: Product[] = [
  { code: 'SKU00011', name: 'DAAL SEV', gm: 16, pcsPerCtn: 72, retailPrice: 20, tp: 18 },
  { code: 'SKU00001', name: 'POTATO STICK (CHATPATA)', gm: 16, pcsPerCtn: 72, retailPrice: 20, tp: 18 },
  { code: 'SKU00030', name: 'SPICY MIX NIMKO', gm: 16, pcsPerCtn: 72, retailPrice: 20, tp: 18 },
  { code: 'SKU00021', name: 'NIMBOO DAAL', gm: 16, pcsPerCtn: 72, retailPrice: 20, tp: 18 },
  { code: 'SKU00023', name: 'NIMKO MIX HOT & SPICY', gm: 16, pcsPerCtn: 72, retailPrice: 20, tp: 18 },
  { code: 'SKU00024', name: 'NIMKO MIX LEMON & CHILLI', gm: 16, pcsPerCtn: 72, retailPrice: 20, tp: 18 },
  { code: 'SKU00003', name: 'MUNCHY (SALTED)', gm: 10, pcsPerCtn: 48, retailPrice: 20, tp: 18 },
  { code: 'SKU00005', name: 'MUNCHY (VEGETABLE EU)', gm: 10, pcsPerCtn: 48, retailPrice: 20, tp: 18 },
  { code: 'N/A', name: 'MUNCHY (PLAIN)', gm: 10, pcsPerCtn: 48, retailPrice: 20, tp: 18 },
  { code: 'SKU00037', name: 'DAAL SEV Box', gm: 192, pcsPerCtn: 12, retailPrice: 240, tp: 216 },
  { code: 'SKU00038', name: 'POTATO STICK Box', gm: 192, pcsPerCtn: 12, retailPrice: 240, tp: 216 },
  { code: 'SKU00068', name: 'SPICY MIX NIMKO Box', gm: 192, pcsPerCtn: 12, retailPrice: 240, tp: 216 },
  { code: 'SKU00039', name: 'NIMBOO DAAL Box', gm: 192, pcsPerCtn: 12, retailPrice: 240, tp: 216 },
  { code: 'SKU00040', name: 'NIMKO MIX HOT & SPICY Box', gm: 192, pcsPerCtn: 12, retailPrice: 240, tp: 216 },
  { code: 'SKU00041', name: 'NIMKO MIX LEMON & CHILLI Box', gm: 192, pcsPerCtn: 12, retailPrice: 240, tp: 216 },
  { code: 'SKU00020', name: 'NIMBOO DAAL 24g', gm: 24, pcsPerCtn: 48, retailPrice: 30, tp: 27 },
  { code: 'SKU00009', name: 'DAAL MOUNG 18g', gm: 18, pcsPerCtn: 72, retailPrice: 30, tp: 27 },
  { code: 'SKU00042', name: 'DAAL MOUNG Box', gm: 216, pcsPerCtn: 12, retailPrice: 360, tp: 324 },
  { code: 'SKU00050', name: 'NIMKO MIX HOT & SPICY 24g', gm: 24, pcsPerCtn: 48, retailPrice: 30, tp: 27 },
  { code: 'SKU00002', name: 'POTATO STICK (S&P)', gm: 24, pcsPerCtn: 48, retailPrice: 30, tp: 27 },
  { code: 'SKU00034', name: 'SALTED PEANUT 16g', gm: 16, pcsPerCtn: 84, retailPrice: 30, tp: 27 },
  { code: 'SKU00031', name: 'PEANUT UNSALTED 16g', gm: 16, pcsPerCtn: 84, retailPrice: 30, tp: 27 },
  { code: 'SKU00051', name: 'NIMKO MIX LEMON & CHILLI 24g', gm: 24, pcsPerCtn: 48, retailPrice: 30, tp: 27 },
  { code: 'SKU00007', name: 'SPICY MIX NIMKO 24g', gm: 24, pcsPerCtn: 48, retailPrice: 30, tp: 27 },
  { code: 'SKU00012', name: 'DAAL SEV 24g', gm: 24, pcsPerCtn: 48, retailPrice: 30, tp: 27 },
  { code: 'SKU00004', name: 'MUNCHY (SALTED) 15g', gm: 15, pcsPerCtn: 36, retailPrice: 30, tp: 27 },
  { code: 'SKU00006', name: 'MUNCHY (VEGETABLE EU) 15g', gm: 15, pcsPerCtn: 36, retailPrice: 30, tp: 27 },
  { code: 'N/A1', name: 'MUNCHY (PLAIN) 15g', gm: 15, pcsPerCtn: 36, retailPrice: 30, tp: 27 },
  { code: 'SKU00025', name: 'NIMKO SALT & PEPPER 40g', gm: 40, pcsPerCtn: 36, retailPrice: 50, tp: 45 },
  { code: 'SKU00008', name: 'CHEWRA NIMKO', gm: 30, pcsPerCtn: 36, retailPrice: 50, tp: 45 },
  { code: 'SKU00010', name: 'DAAL MOUNG 30g', gm: 30, pcsPerCtn: 48, retailPrice: 50, tp: 45 },
  { code: 'SKU00035', name: 'SALTED PEANUT 25g', gm: 25, pcsPerCtn: 48, retailPrice: 50, tp: 45 },
  { code: 'SKU00032', name: 'PEANUT UNSALTED 25g', gm: 25, pcsPerCtn: 48, retailPrice: 50, tp: 45 },
  { code: 'SKU00014', name: 'KHAT MITHA', gm: 30, pcsPerCtn: 36, retailPrice: 50, tp: 45 },
  { code: 'SKU00013', name: 'KARACHI NIMCO MIX', gm: 40, pcsPerCtn: 36, retailPrice: 50, tp: 45 },
  { code: 'SKU00056', name: 'MUNCHY (SALTED) 25g', gm: 25, pcsPerCtn: 24, retailPrice: 50, tp: 45 },
  { code: 'SKU00069', name: 'MUNCHY (VEGETABLE EU) 25g', gm: 25, pcsPerCtn: 24, retailPrice: 50, tp: 45 },
  { code: 'N/A2', name: 'MUNCHY (PLAIN) 25g', gm: 25, pcsPerCtn: 24, retailPrice: 50, tp: 45 },
  { code: 'SKU00036', name: 'SALTED PEANUT 40g', gm: 40, pcsPerCtn: 36, retailPrice: 80, tp: 72 },
  { code: 'SKU00033', name: 'PEANUT UNSALTED 40g', gm: 40, pcsPerCtn: 36, retailPrice: 80, tp: 72 },
  { code: 'SKU00029', name: 'SHAHI MIX 80g', gm: 80, pcsPerCtn: 36, retailPrice: 250, tp: 225 },
  { code: 'SKU00016', name: 'LAHORI MIX 80g', gm: 80, pcsPerCtn: 36, retailPrice: 180, tp: 162 },
  { code: 'SKU00054', name: 'NIMKO SALT & PEPPER 80g', gm: 80, pcsPerCtn: 36, retailPrice: 120, tp: 108 },
  { code: 'SKU00028', name: 'SHAHI MIX 180g', gm: 180, pcsPerCtn: 30, retailPrice: 500, tp: 450 },
  { code: 'SKU00015', name: 'LAHORI MIX 180g', gm: 180, pcsPerCtn: 30, retailPrice: 400, tp: 360 },
  { code: 'SKU00052', name: 'LEMON & CHILLI 180g', gm: 180, pcsPerCtn: 30, retailPrice: 270, tp: 243 },
  { code: 'SKU00019', name: 'MASOOR MASALA 180g', gm: 180, pcsPerCtn: 30, retailPrice: 270, tp: 243 },
  { code: 'SKU00053', name: 'NIMKO SALT & PEPPER 180g', gm: 180, pcsPerCtn: 30, retailPrice: 270, tp: 243 },
  { code: 'SKU00064', name: 'DAAL SEV Strip', gm: 16, pcsPerCtn: 72, retailPrice: 20, tp: 18 },
  { code: 'SKU00058', name: 'POTATO STICK Strip', gm: 16, pcsPerCtn: 72, retailPrice: 20, tp: 18 },
  { code: 'SKU00059', name: 'SPICY MIX NIMKO Strip', gm: 16, pcsPerCtn: 72, retailPrice: 20, tp: 18 },
  { code: 'SKU00060', name: 'NIMBOO DAAL Strip', gm: 16, pcsPerCtn: 72, retailPrice: 20, tp: 18 },
  { code: 'SKU00061', name: 'NIMKO MIX HOT & SPICY Strip', gm: 16, pcsPerCtn: 72, retailPrice: 20, tp: 18 },
  { code: 'SKU00062', name: 'NIMKO MIX LEMON & CHILLI Strip', gm: 16, pcsPerCtn: 72, retailPrice: 20, tp: 18 },
  { code: 'SKU00063', name: 'DAAL MOUNG Strip', gm: 18, pcsPerCtn: 72, retailPrice: 30, tp: 27 },
  { code: 'SKU00065', name: 'MASALA PEANUT 16g', gm: 16, pcsPerCtn: 84, retailPrice: 30, tp: 27 },
  { code: 'SKU00066', name: 'MASALA PEANUT 25g', gm: 25, pcsPerCtn: 48, retailPrice: 50, tp: 45 },
  { code: 'SKU00067', name: 'MASALA PEANUT 40g', gm: 40, pcsPerCtn: 36, retailPrice: 80, tp: 72 },
]


interface ReturnItem {
  id: string
  code: string
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
  const [productSearch, setProductSearch] = useState('')

  const filteredProducts = productSearch.trim() === ''
    ? PRODUCTS
    : PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.code.toLowerCase().includes(productSearch.toLowerCase())
      )

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
    if (!currentName || !currentQty || !currentExpiry) {
      alert('Please fill product name, quantity, and expiry date.')
      return
    }
    const matched = PRODUCTS.find(p => p.name === currentName)
    setProducts([...products, {
      id: Math.random().toString(36).substr(2, 9),
      code: matched?.code || '',
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
                  {p.code && <div className="text-[9px] font-bold text-blue-600 uppercase tracking-wide mt-0.5">{p.code}</div>}
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
              <div className="relative mb-1.5">
                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[14px]">search</span>
                <input
                  type="text"
                  placeholder="Search product or SKU code..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-7 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <select 
                value={currentName} 
                onChange={e => setCurrentName(e.target.value)}
                size={productSearch ? Math.min(filteredProducts.length + 1, 6) : 1}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="">— Select Product —</option>
                {filteredProducts.map(p => (
                  <option key={p.code} value={p.name}>
                    {p.code} • {p.name} ({p.gm}g) — Rs.{p.retailPrice}
                  </option>
                ))}
              </select>
              {currentName && (
                <div className="mt-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 rounded px-2 py-1 flex items-center justify-between">
                  <span>✓ {currentName}</span>
                  <button onClick={() => { setCurrentName(''); setProductSearch('') }} className="text-slate-400 hover:text-red-500">✕</button>
                </div>
              )}
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
