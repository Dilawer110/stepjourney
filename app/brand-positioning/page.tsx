'use client'
import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Product {
  code: string; name: string; gm: number; pcsPerCtn: number; category: string
}

const PRODUCTS: Product[] = [
  { code: 'SKU00011', name: 'DAAL SEV 16g', gm: 16, pcsPerCtn: 72, category: 'Nimko' },
  { code: 'SKU00001', name: 'POTATO STICK (CHATPATA) 16g', gm: 16, pcsPerCtn: 72, category: 'Potato Sticks' },
  { code: 'SKU00030', name: 'SPICY MIX NIMKO 16g', gm: 16, pcsPerCtn: 72, category: 'Nimko' },
  { code: 'SKU00021', name: 'NIMBOO DAAL 16g', gm: 16, pcsPerCtn: 72, category: 'Nimko' },
  { code: 'SKU00023', name: 'NIMKO MIX HOT & SPICY 16g', gm: 16, pcsPerCtn: 72, category: 'Nimko' },
  { code: 'SKU00024', name: 'NIMKO MIX LEMON & CHILLI 16g', gm: 16, pcsPerCtn: 72, category: 'Nimko' },
  { code: 'SKU00003', name: 'MUNCHY (SALTED) 10g', gm: 10, pcsPerCtn: 48, category: 'Munchy' },
  { code: 'SKU00005', name: 'MUNCHY (VEGETABLE EU) 10g', gm: 10, pcsPerCtn: 48, category: 'Munchy' },
  { code: 'SKU00037', name: 'DAAL SEV Box 192g', gm: 192, pcsPerCtn: 12, category: 'Nimko' },
  { code: 'SKU00038', name: 'POTATO STICK Box 192g', gm: 192, pcsPerCtn: 12, category: 'Potato Sticks' },
  { code: 'SKU00068', name: 'SPICY MIX NIMKO Box 192g', gm: 192, pcsPerCtn: 12, category: 'Nimko' },
  { code: 'SKU00039', name: 'NIMBOO DAAL Box 192g', gm: 192, pcsPerCtn: 12, category: 'Nimko' },
  { code: 'SKU00040', name: 'NIMKO MIX HOT & SPICY Box 192g', gm: 192, pcsPerCtn: 12, category: 'Nimko' },
  { code: 'SKU00041', name: 'NIMKO MIX LEMON & CHILLI Box 192g', gm: 192, pcsPerCtn: 12, category: 'Nimko' },
  { code: 'SKU00020', name: 'NIMBOO DAAL 24g', gm: 24, pcsPerCtn: 48, category: 'Nimko' },
  { code: 'SKU00009', name: 'DAAL MOUNG 18g', gm: 18, pcsPerCtn: 72, category: 'Daal' },
  { code: 'SKU00042', name: 'DAAL MOUNG Box 216g', gm: 216, pcsPerCtn: 12, category: 'Daal' },
  { code: 'SKU00050', name: 'NIMKO MIX HOT & SPICY 24g', gm: 24, pcsPerCtn: 48, category: 'Nimko' },
  { code: 'SKU00002', name: 'POTATO STICK (S&P) 24g', gm: 24, pcsPerCtn: 48, category: 'Potato Sticks' },
  { code: 'SKU00034', name: 'SALTED PEANUT 16g', gm: 16, pcsPerCtn: 84, category: 'Peanuts' },
  { code: 'SKU00031', name: 'PEANUT UNSALTED 16g', gm: 16, pcsPerCtn: 84, category: 'Peanuts' },
  { code: 'SKU00051', name: 'NIMKO MIX LEMON & CHILLI 24g', gm: 24, pcsPerCtn: 48, category: 'Nimko' },
  { code: 'SKU00007', name: 'SPICY MIX NIMKO 24g', gm: 24, pcsPerCtn: 48, category: 'Nimko' },
  { code: 'SKU00012', name: 'DAAL SEV 24g', gm: 24, pcsPerCtn: 48, category: 'Nimko' },
  { code: 'SKU00004', name: 'MUNCHY (SALTED) 15g', gm: 15, pcsPerCtn: 36, category: 'Munchy' },
  { code: 'SKU00006', name: 'MUNCHY (VEGETABLE EU) 15g', gm: 15, pcsPerCtn: 36, category: 'Munchy' },
  { code: 'SKU00025', name: 'NIMKO SALT & PEPPER 40g', gm: 40, pcsPerCtn: 36, category: 'Nimko' },
  { code: 'SKU00008', name: 'CHEWRA NIMKO 30g', gm: 30, pcsPerCtn: 36, category: 'Nimko' },
  { code: 'SKU00010', name: 'DAAL MOUNG 30g', gm: 30, pcsPerCtn: 48, category: 'Daal' },
  { code: 'SKU00035', name: 'SALTED PEANUT 25g', gm: 25, pcsPerCtn: 48, category: 'Peanuts' },
  { code: 'SKU00032', name: 'PEANUT UNSALTED 25g', gm: 25, pcsPerCtn: 48, category: 'Peanuts' },
  { code: 'SKU00014', name: 'KHAT MITHA 30g', gm: 30, pcsPerCtn: 36, category: 'Nimko' },
  { code: 'SKU00013', name: 'KARACHI NIMCO MIX 40g', gm: 40, pcsPerCtn: 36, category: 'Nimko' },
  { code: 'SKU00056', name: 'MUNCHY (SALTED) 25g', gm: 25, pcsPerCtn: 24, category: 'Munchy' },
  { code: 'SKU00069', name: 'MUNCHY (VEGETABLE EU) 25g', gm: 25, pcsPerCtn: 24, category: 'Munchy' },
  { code: 'SKU00036', name: 'SALTED PEANUT 40g', gm: 40, pcsPerCtn: 36, category: 'Peanuts' },
  { code: 'SKU00033', name: 'PEANUT UNSALTED 40g', gm: 40, pcsPerCtn: 36, category: 'Peanuts' },
  { code: 'SKU00029', name: 'SHAHI MIX 80g', gm: 80, pcsPerCtn: 36, category: 'Premium' },
  { code: 'SKU00016', name: 'LAHORI MIX 80g', gm: 80, pcsPerCtn: 36, category: 'Premium' },
  { code: 'SKU00054', name: 'NIMKO SALT & PEPPER 80g', gm: 80, pcsPerCtn: 36, category: 'Nimko' },
  { code: 'SKU00028', name: 'SHAHI MIX 180g', gm: 180, pcsPerCtn: 30, category: 'Premium' },
  { code: 'SKU00015', name: 'LAHORI MIX 180g', gm: 180, pcsPerCtn: 30, category: 'Premium' },
  { code: 'SKU00052', name: 'LEMON & CHILLI 180g', gm: 180, pcsPerCtn: 30, category: 'Nimko' },
  { code: 'SKU00019', name: 'MASOOR MASALA 180g', gm: 180, pcsPerCtn: 30, category: 'Nimko' },
  { code: 'SKU00053', name: 'NIMKO SALT & PEPPER 180g', gm: 180, pcsPerCtn: 30, category: 'Nimko' }
]

type UOM = 'U' | 'C'
interface SKUStock { qty: number; uom: UOM }

function SurveyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const outletId = searchParams.get('id') || ''
  
  const [loading, setLoading] = useState(true)
  const [outlet, setOutlet] = useState<any>(null)
  
  // Survey State
  const [productSource, setProductSource] = useState<string>('')
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set())
  const [stock, setStock] = useState<Record<string, SKUStock>>({})
  
  const [currentDisplay, setCurrentDisplay] = useState<Set<string>>(new Set())
  const [brandBlock, setBrandBlock] = useState<string>('')
  const [merchTools, setMerchTools] = useState<Set<string>>(new Set())
  const [spotPhoto, setSpotPhoto] = useState<boolean>(false)
  
  // LMT Only
  const [primaryShelf, setPrimaryShelf] = useState<string>('')
  const [eyeLevel, setEyeLevel] = useState<boolean>(false)
  const [facings, setFacings] = useState<number>(0)
  
  // OCD
  const [ocd, setOcd] = useState<string>('')
  const [ocdStatus, setOcdStatus] = useState<string>('')
  const [ocdPhoto, setOcdPhoto] = useState<boolean>(false)
  
  // Branding
  const [branding, setBranding] = useState<string>('')
  const [brandingPhoto, setBrandingPhoto] = useState<boolean>(false)
  
  const [submitting, setSubmitting] = useState(false)

  const ALL_CATS = ['Munchy', 'Nimko', 'Peanuts', 'Potato Sticks', 'Daal', 'Premium']

  useEffect(() => {
    if (!outletId) { router.push('/'); return }
    const cached = localStorage.getItem('todayOutlets')
    if (cached) {
      const parsed = JSON.parse(cached)
      const found = parsed.merged?.find((o: any) => o.id === outletId)
      if (found) setOutlet(found)
    }
    setLoading(false)
  }, [outletId, router])

  const toggleSet = (set: Set<string>, val: string, setter: any) => {
    const next = new Set(set)
    if (next.has(val)) next.delete(val)
    else next.add(val)
    setter(next)
  }

  const updateStock = (code: string, qtyDelta: number) => {
    setStock(prev => {
      const cur = prev[code] || { qty: 0, uom: 'C' }
      const newQty = Math.max(0, cur.qty + qtyDelta)
      return { ...prev, [code]: { ...cur, qty: newQty } }
    })
  }
  
  const setStockVal = (code: string, qty: string) => {
    const n = parseInt(qty)
    if (isNaN(n) || n < 0) return
    setStock(prev => {
      const cur = prev[code] || { qty: 0, uom: 'C' }
      return { ...prev, [code]: { ...cur, qty: n } }
    })
  }

  const toggleUOM = (code: string, uom: UOM) => {
    setStock(prev => {
      const cur = prev[code] || { qty: 0, uom: 'C' }
      return { ...prev, [code]: { ...cur, uom } }
    })
  }

  const handleSave = async () => {
    setSubmitting(true)
    
    // Compute normalized units
    const normalizedStock = Object.entries(stock).map(([code, s]) => {
      const prod = PRODUCTS.find(p => p.code === code)
      const multiplier = s.uom === 'C' ? (prod?.pcsPerCtn || 1) : 1
      return {
        code,
        enteredQty: s.qty,
        uom: s.uom,
        normalizedUnits: s.qty * multiplier
      }
    }).filter(s => s.enteredQty > 0)

    const payload = {
      id: 'BPS-' + Date.now(),
      outletId,
      outletName: outlet?.name,
      channel: outlet?.channel,
      date: new Date().toISOString(),
      productSource,
      categories: Array.from(selectedCats),
      stock: normalizedStock,
      currentDisplay: Array.from(currentDisplay),
      brandBlock,
      merchTools: Array.from(merchTools),
      spotPhotoCaptured: spotPhoto,
      primaryShelf: outlet?.channel === 'LMT' ? { status: primaryShelf, eyeLevel, facings } : null,
      ocd: ocd === 'Yes' ? { status: ocdStatus, photoCaptured: ocdPhoto } : null,
      branding: branding !== 'None' && branding !== '' ? { type: branding, photoCaptured: brandingPhoto } : null
    }

    try {
      const todayStr = new Date().toISOString().slice(0, 10)
      const key = 'survey_' + todayStr
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      localStorage.setItem(key, JSON.stringify([...existing, payload]))
      
      alert('Survey saved successfully (Offline)')
      router.back()
    } catch (e) {
      alert('Failed to save survey')
      setSubmitting(false)
    }
  }

  if (loading) return null

  const isLMT = outlet?.channel === 'LMT'

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#f8fafc]">
      <div className="bg-[#0f294a] text-white px-4 py-3 flex items-center gap-3 shadow-md z-10 shrink-0">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center -ml-2">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div className="flex-1">
          <h2 className="text-sm font-bold">Brand Positioning</h2>
          <p className="text-[10px] text-slate-300 truncate">{outlet?.name || 'Loading...'}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-24">
        
        {/* 1. PRODUCT SOURCE */}
        <section className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">1. Product Source</h3>
            <span className="material-symbols-outlined text-[16px] text-slate-400">local_shipping</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'distributor', icon: 'local_shipping', label: 'Our Distr.' },
              { id: 'wholesale', icon: 'storefront', label: 'Open Mkt' },
              { id: 'none', icon: 'block', label: 'Not Selling' }
            ].map(opt => (
              <button key={opt.id} onClick={() => setProductSource(opt.id)}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all ${productSource === opt.id ? 'bg-[#0f294a] border-[#0f294a] text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>
                <span className="text-[10px] font-bold leading-tight">{opt.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 2. CATEGORIES & SKU STOCK */}
        <section className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">2. SKU Stock</h3>
            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{selectedCats.size} Selected</span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {ALL_CATS.map(cat => (
              <button key={cat} onClick={() => toggleSet(selectedCats, cat, setSelectedCats)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${selectedCats.has(cat) ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-4 mt-2">
            {Array.from(selectedCats).map(cat => (
              <div key={cat} className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">{cat}</div>
                {PRODUCTS.filter(p => p.category === cat).map(p => {
                  const s = stock[p.code] || { qty: 0, uom: 'C' }
                  return (
                    <div key={p.code} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-slate-800 truncate leading-tight">{p.name}</div>
                        <div className="text-[9px] font-mono text-slate-500">{p.code} • {p.pcsPerCtn}/ctn</div>
                      </div>
                      
                      <div className="flex items-center bg-white rounded border border-slate-200 shadow-sm p-0.5">
                        <button onClick={() => updateStock(p.code, -1)} className="w-6 h-6 flex items-center justify-center text-blue-600 active:bg-blue-50 rounded text-sm font-bold">−</button>
                        <input type="number" value={s.qty || ''} onChange={e => setStockVal(p.code, e.target.value)} className="w-8 text-center text-xs font-bold border-none p-0 focus:ring-0 text-slate-800" placeholder="0" />
                        <button onClick={() => updateStock(p.code, 1)} className="w-6 h-6 flex items-center justify-center text-blue-600 active:bg-blue-50 rounded text-sm font-bold">+</button>
                      </div>

                      <div className="flex rounded border border-slate-200 bg-white p-0.5 shadow-sm">
                        <button onClick={() => toggleUOM(p.code, 'U')} className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold ${s.uom === 'U' ? 'bg-[#0f294a] text-white' : 'text-slate-500'}`}>U</button>
                        <button onClick={() => toggleUOM(p.code, 'C')} className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold ${s.uom === 'C' ? 'bg-[#0f294a] text-white' : 'text-slate-500'}`}>C</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </section>

        {/* 4. CURRENT DISPLAY */}
        <section className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">4. Current Display</h3>
          <div className="grid grid-cols-2 gap-2">
            {['Display Stand', 'Hanging Basket', 'Counter Top Dispenser', 'Wall Hanging Unit', 'Outlet Own Fixture', 'No Proper Display'].map(disp => (
              <button key={disp} onClick={() => toggleSet(currentDisplay, disp, setCurrentDisplay)}
                className={`flex items-center gap-1.5 p-2 rounded-lg border text-left transition-all ${currentDisplay.has(disp) ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 text-[11px]'}`}>
                <span className="material-symbols-outlined text-[16px]">{currentDisplay.has(disp) ? 'check_box' : 'check_box_outline_blank'}</span>
                <span className={`text-[10px] leading-tight ${currentDisplay.has(disp) ? 'font-bold' : 'font-medium'}`}>{disp}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 5. BRAND BLOCK & 6. TOOLS */}
        <div className="grid grid-cols-2 gap-3">
          <section className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">Brand Block</h3>
            <div className="flex flex-col gap-1.5">
              {['Good', 'Partial', 'No'].map(opt => (
                <button key={opt} onClick={() => setBrandBlock(opt)} className={`text-left px-3 py-2 rounded-lg border text-[11px] font-bold transition-all ${brandBlock === opt ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">Merch. Tools</h3>
            <div className="flex flex-col gap-1.5">
              {['Display Stand', 'Basket', 'Counter Top', 'Wall Hanging', 'None'].map(opt => (
                <button key={opt} onClick={() => toggleSet(merchTools, opt, setMerchTools)} className={`text-left px-2 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${merchTools.has(opt) ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  {merchTools.has(opt) ? '✓ ' : ''}{opt}
                </button>
              ))}
              <button onClick={() => setSpotPhoto(!spotPhoto)} className={`mt-1 flex items-center justify-center gap-1 p-2 rounded-lg border text-[10px] font-bold transition-all ${spotPhoto ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                {spotPhoto ? 'Photo Added' : 'Take Spot Photo'}
              </button>
            </div>
          </section>
        </div>

        {/* 7. PRIMARY SHELF (LMT ONLY) */}
        {isLMT && (
          <section className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-3 border border-indigo-100 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[11px] font-extrabold text-indigo-800 uppercase tracking-wide flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">store</span> LMT Primary Shelf
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {['Excellent', 'Good', 'Average', 'Poor', 'None'].map(opt => (
                <button key={opt} onClick={() => setPrimaryShelf(opt)} className={`text-center py-1.5 rounded-md border text-[10px] font-bold transition-all ${primaryShelf === opt ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-indigo-200 text-indigo-700'}`}>
                  {opt}
                </button>
              ))}
            </div>
            {primaryShelf && primaryShelf !== 'None' && (
              <div className="flex gap-2">
                <button onClick={() => setEyeLevel(!eyeLevel)} className={`flex-1 flex items-center justify-center gap-1 p-2 rounded-lg border text-[11px] font-bold transition-all ${eyeLevel ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                  <span className="material-symbols-outlined text-[16px]">{eyeLevel ? 'visibility' : 'visibility_off'}</span>
                  Eye Level
                </button>
                <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 p-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Facings</span>
                  <input type="number" value={facings || ''} onChange={e => setFacings(parseInt(e.target.value) || 0)} className="w-full text-right font-bold text-sm border-none p-0 focus:ring-0 text-slate-800" placeholder="0" />
                </div>
              </div>
            )}
          </section>
        )}

        {/* 8. OCD & 9. BRANDING */}
        <div className="grid grid-cols-2 gap-3">
          <section className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center justify-between">
              Out of Cat. (OCD)
              <span className="material-symbols-outlined text-[14px]">category</span>
            </h3>
            <div className="flex gap-1.5 mb-2">
              {['Yes', 'No'].map(opt => (
                <button key={opt} onClick={() => setOcd(opt)} className={`flex-1 text-center py-1.5 rounded-lg border text-[11px] font-bold transition-all ${ocd === opt ? 'bg-slate-800 border-slate-800 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  {opt}
                </button>
              ))}
            </div>
            {ocd === 'Yes' && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                <select value={ocdStatus} onChange={e => setOcdStatus(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold p-2 text-slate-700 outline-none">
                  <option value="">Status...</option>
                  <option>Good</option><option>Average</option><option>Poor</option>
                </select>
                <button onClick={() => setOcdPhoto(!ocdPhoto)} className={`w-full flex items-center justify-center gap-1 p-2 rounded-lg border text-[10px] font-bold transition-all ${ocdPhoto ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                  <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                  {ocdPhoto ? 'Added' : 'Photo'}
                </button>
              </div>
            )}
          </section>

          <section className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center justify-between">
              Ext. Branding
              <span className="material-symbols-outlined text-[14px]">branding_watermark</span>
            </h3>
            <div className="flex flex-col gap-1.5">
              {['Signboard', 'Vinyl Skin', 'Both', 'None'].map(opt => (
                <button key={opt} onClick={() => setBranding(opt)} className={`text-left px-2 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${branding === opt ? 'bg-[#0f294a] border-[#0f294a] text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  {opt}
                </button>
              ))}
              {branding && branding !== 'None' && (
                <button onClick={() => setBrandingPhoto(!brandingPhoto)} className={`mt-1 flex items-center justify-center gap-1 p-2 rounded-lg border text-[10px] font-bold transition-all animate-in fade-in slide-in-from-top-2 ${brandingPhoto ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                  <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                  {brandingPhoto ? 'Added' : 'Shop Photo'}
                </button>
              )}
            </div>
          </section>
        </div>

      </div>

      {/* BOTTOM ACTIONS */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] p-3 flex gap-2 z-30">
        <button onClick={() => router.back()} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition">
          Cancel
        </button>
        <button onClick={handleSave} disabled={submitting} className="flex-[2] py-3 bg-[#0f294a] hover:bg-[#1a3a63] text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-70">
          {submitting ? <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span> : <span className="material-symbols-outlined text-[18px]">save</span>}
          Save Survey
        </button>
      </div>

    </div>
  )
}

export default function BrandPositioningSurvey() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <SurveyContent />
    </Suspense>
  )
}
