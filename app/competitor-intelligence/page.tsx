'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { userStorage } from '@/lib/user-storage'
import { supabase } from '@/lib/supabase'

type CIRPhoto = { type: string, base64: string, timestamp: number }
type CIREntry = {
  id: string,
  brand: string,
  sku: string,
  variant: string,
  packSize: string,
  packFormat: string,
  photos: CIRPhoto[],
  mrp: string,
  asp: string,
  tradePrice: string,
  netCost: string,
  onInvoiceDiscountRate: string,
  schemeType: string,
  tradeOffer: string,
  freeSku: string,
  freeQty: string,
  consumerPromo: string[],
  inStock: boolean | null,
  stockDepth: string,
  movementSpeed: string,
  displayTools: string[],
  posmOutStore: string[],
  posmInStore: string[],
  exclusiveAgreement: boolean | null,
  shelfRent: string,
  agreementDuration: string,
  exclusivityNotes: string,
}

const DEFAULT_BRANDS = ['Super Crisp', 'Kolson Slanty', 'Kurkuray Nimko', 'Shahi Foods', 'Salwa Nimko', 'Hash Slanty']

const emptyEntry = (): CIREntry => ({
  id: crypto.randomUUID(),
  brand: '', sku: '', variant: '', packSize: '', packFormat: '', photos: [],
  mrp: '', asp: '', tradePrice: '', netCost: '',
  onInvoiceDiscountRate: '', schemeType: '', tradeOffer: '', freeSku: '', freeQty: '', consumerPromo: [],
  inStock: null, stockDepth: '', movementSpeed: '',
  displayTools: [], posmOutStore: [], posmInStore: [],
  exclusiveAgreement: null, shelfRent: '', agreementDuration: '', exclusivityNotes: ''
})

function CompetitorIntelligenceForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const outletCode = searchParams.get('id') || ''
  const outletName = searchParams.get('name') || 'Outlet'

  const [brands, setBrands] = useState<string[]>(DEFAULT_BRANDS)
  const [newBrandMode, setNewBrandMode] = useState(false)
  const [newBrandText, setNewBrandText] = useState('')

  const [visitType, setVisitType] = useState<'In-Store' | 'Out-Store'>('In-Store')
  const [entries, setEntries] = useState<CIREntry[]>([])
  const [currentEntryIdx, setCurrentEntryIdx] = useState<number>(-1)
  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)
  const reportId = useRef<string | null>(null)
  const [gpsLocation, setGpsLocation] = useState<{lat: number, lng: number} | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activePhotoType, setActivePhotoType] = useState('')

  const [pastReports, setPastReports] = useState<any[]>([])

  // Load drafts and master data
  useEffect(() => {
    try {
    const savedBrands = JSON.parse(userStorage.getItem('cir_master_brands') || '[]')
    if (savedBrands.length > 0) setBrands(savedBrands)
    else userStorage.setItem('cir_master_brands', JSON.stringify(DEFAULT_BRANDS))

    const draft = userStorage.getItem(`cir_draft_${outletCode}`)
    if (draft) {
      const parsed = JSON.parse(draft)
      if (!Array.isArray(parsed.entries)) throw new Error('Invalid saved draft')
      setEntries(parsed.entries)
      setVisitType(parsed.visitType || 'In-Store')
    }
    
    // Load past submitted reports from localStorage cache
    const submitted = JSON.parse(userStorage.getItem('cir_reports_submitted') || '[]')
    const forThisOutlet = submitted.filter((s: any) => s.report.outlet_code === outletCode)
    setPastReports(forThisOutlet)

    setLoaded(true)
    } catch { setError('Saved CIR data could not be read. Your existing data has been preserved.'); return }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGpsLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.warn("GPS disabled")
      )
    }
  }, [outletCode])

  // Autosave
  useEffect(() => {
    if (loaded && outletCode && !success && !submitting.current) {
      try {
        userStorage.setItem(`cir_draft_${outletCode}`, JSON.stringify({ entries, visitType }))
      } catch { setError('Draft could not be saved. Device storage may be full. Keep this form open.'); }
    }
  }, [entries, visitType, outletCode, loaded, success])

  function handleAddNewBrand() {
    const b = newBrandText.trim()
    if (!b) return
    const updated = [b, ...brands.filter(x => x.toLowerCase() !== b.toLowerCase())]
    try { userStorage.setItem('cir_master_brands', JSON.stringify(updated)) }
    catch { setError('Brand could not be saved. Device storage may be full.'); return }
    setBrands(updated)
    setNewBrandMode(false)
    updateEntry('brand', b)
  }

  function handleAddEntry() {
    setEntries(prev => [...prev, emptyEntry()])
    setCurrentEntryIdx(entries.length)
    setCurrentStep(1)
  }

  function updateEntry(field: keyof CIREntry, value: any) {
    const updated = [...entries]
    updated[currentEntryIdx] = { ...updated[currentEntryIdx], [field]: value }
    setEntries(updated)
  }

  function toggleArrayItem(field: 'consumerPromo'|'displayTools'|'posmOutStore'|'posmInStore', item: string) {
    const curr = entries[currentEntryIdx][field] as string[]
    updateEntry(field, curr.includes(item) ? curr.filter(x => x !== item) : [...curr, item])
  }

  async function handlePhotoCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Compress Image via Canvas to keep footprint tiny
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 800
        const scaleSize = MAX_WIDTH / img.width
        canvas.width = MAX_WIDTH
        canvas.height = img.height * scaleSize
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
        const base64 = canvas.toDataURL('image/jpeg', 0.5) // High compression
        
        const photo: CIRPhoto = { type: activePhotoType, base64, timestamp: Date.now() }
        const currentPhotos = entries[currentEntryIdx].photos
        updateEntry('photos', [...currentPhotos.filter(p => p.type !== activePhotoType), photo])
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  async function submitReport() {
    if (submitting.current || !loaded) return
    if (!outletCode) { setError('Open CIR from an outlet card before saving.'); return }
    submitting.current = true
    setSaving(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!reportId.current) reportId.current = crypto.randomUUID()
      const payload = {
        id: reportId.current,
        outlet_code: outletCode,
        user_id: session?.user?.id || 'offline',
        status: 'submitted',
        created_at: new Date().toISOString(),
        lat: gpsLocation?.lat,
        lng: gpsLocation?.lng,
        visit_type: visitType
      }
      
      const lsKey = `cir_reports_submitted`
      const existing = JSON.parse(userStorage.getItem(lsKey) || '[]')
      if (!existing.some((item: any) => item.report.id === payload.id)) existing.push({ report: payload, entries })
      userStorage.setItem(lsKey, JSON.stringify(existing))
      
      userStorage.removeItem(`cir_draft_${outletCode}`)
      
      // Device-local only. A server sync worker has not been implemented.
      setSuccess(true)
      setTimeout(() => router.push('/'), 2000)
    } catch (e) {
      setError('Report could not be saved. Keep this form open and free device storage before retrying.')
      submitting.current = false
    }
    setSaving(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-white text-[32px]">check</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Saved on this device</h2>
      </div>
    )
  }

  const activeEntry = entries[currentEntryIdx]

  return (
    <div className="min-h-[100dvh] bg-surface flex flex-col font-sans pb-32">
      <header className="sticky top-0 w-full z-50 pt-safe bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-slate-700">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Competitor Intel</h1>
              <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{outletName}</p>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => setVisitType('In-Store')} className={`px-2 py-1 text-[11px] font-bold rounded-full transition-colors ${visitType === 'In-Store' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-600'}`}>In-Store</button>
             <button onClick={() => setVisitType('Out-Store')} className={`px-2 py-1 text-[11px] font-bold rounded-full transition-colors ${visitType === 'Out-Store' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-600'}`}>Out-Store</button>
          </div>
        </div>
      </header>

      {error && <p role="alert" className="p-4 text-red-700">{error}</p>}
      {!outletCode && <p className="p-4 text-amber-700">Preview only. Open CIR from an outlet card to save a report.</p>}
      <p className="px-4 py-2 text-xs text-slate-600">CIR reports are stored on this device. Database synchronization is not available yet.</p>
      <main className="flex-1 px-4 mt-4 max-w-md mx-auto w-full flex flex-col gap-4">
        
        {pastReports.length > 0 && currentEntryIdx === -1 && (
          <section className="bg-white p-4 rounded-xl shadow-sm flex flex-col gap-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-400">history</span>
              Past Reports ({pastReports.length})
            </h2>
            {pastReports.map((pr, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded-lg flex justify-between items-center border border-slate-100">
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-bold text-sm text-slate-800 truncate">{new Date(pr.report.created_at).toLocaleDateString()}</span>
                  <span className="text-[11px] text-slate-500 truncate">{pr.entries?.length || 0} Products · {pr.report.visit_type}</span>
                </div>
                <div className="flex gap-2 ml-2">
                  <button onClick={() => alert('View only mode: To be implemented per role restrictions')} className="px-3 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-bold text-slate-600">View</button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Competitor Log (Entries) */}
        <section className="bg-white p-4 rounded-xl shadow-sm flex flex-col gap-3">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-sky-600">inventory_2</span>
            Competitor Log ({entries.length})
          </h2>
          {entries.map((entry, idx) => (
            <div key={entry.id} className="bg-slate-50 p-3 rounded-lg flex justify-between items-center border border-slate-100">
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-bold text-sm text-slate-800 truncate">{entry.brand || 'Unnamed Brand'} - {entry.sku || 'SKU'}</span>
                <span className="text-[11px] text-slate-500 truncate">{entry.mrp ? `MRP ${entry.mrp}` : 'No pricing'}</span>
              </div>
              <div className="flex gap-2 ml-2">
                <button onClick={() => setCurrentEntryIdx(idx)} className="w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-200 text-sky-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
                <button onClick={() => {
                  setEntries(prev => prev.filter((_, i) => i !== idx))
                  if (currentEntryIdx === idx) setCurrentEntryIdx(-1)
                  else if (currentEntryIdx > idx) setCurrentEntryIdx(currentEntryIdx - 1)
                }} className="w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-200 text-red-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          ))}
          <button onClick={handleAddEntry} disabled={!loaded} className="w-full h-11 rounded-lg bg-slate-100 text-sky-700 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition">
            <span className="material-symbols-outlined text-[18px]">add_circle</span> Add Competitor SKU
          </button>
        </section>

        {activeEntry && (
          <>
            <nav className="sticky top-16 z-40 bg-surface/95 backdrop-blur-md py-2 overflow-x-auto no-scrollbar flex gap-2">
              {['Product', 'Pricing', 'Commercial', 'Stock', 'Displays', 'POSM', 'Contracts', 'Evidence'].map((step, idx) => (
                <button key={step} onClick={() => setCurrentStep(idx+1)} className={`px-4 py-1.5 rounded-full text-[12px] font-bold shrink-0 shadow-sm transition ${currentStep === idx+1 ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                  {idx+1}. {step}
                </button>
              ))}
            </nav>

            <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              {currentStep === 1 && (
                <div className="flex flex-col gap-4">
                  <h3 className="font-bold text-slate-800 text-lg border-b pb-2 mb-2">1. Product</h3>
                  <div>
                    <label className="text-[12px] font-bold text-slate-600">Brand</label>
                    {!newBrandMode ? (
                       <select value={activeEntry.brand} onChange={e => {
                         if(e.target.value === 'ADD_NEW') setNewBrandMode(true)
                         else updateEntry('brand', e.target.value)
                       }} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                         <option value="">Select Brand...</option>
                         {brands.map(b => <option key={b} value={b}>{b}</option>)}
                         <option value="ADD_NEW">+ Add New Brand</option>
                       </select>
                    ) : (
                       <div className="flex mt-1 gap-2">
                         <input autoFocus type="text" value={newBrandText} onChange={e => setNewBrandText(e.target.value)} placeholder="Type brand name" className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                         <button onClick={handleAddNewBrand} className="px-4 bg-slate-800 text-white rounded-lg text-sm font-bold">Save</button>
                         <button onClick={() => setNewBrandMode(false)} className="px-3 bg-slate-200 rounded-lg text-slate-600"><span className="material-symbols-outlined text-[16px]">close</span></button>
                       </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-slate-600">Product / SKU</label>
                    <input type="text" value={activeEntry.sku} onChange={e => updateEntry('sku', e.target.value)} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="e.g. Kurkure Chutney" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[12px] font-bold text-slate-600">Variant</label>
                      <input type="text" value={activeEntry.variant} onChange={e => updateEntry('variant', e.target.value)} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="text-[12px] font-bold text-slate-600">Pack Size</label>
                      <input type="text" value={activeEntry.packSize} onChange={e => updateEntry('packSize', e.target.value)} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="e.g. 40g" />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="flex flex-col gap-4">
                  <h3 className="font-bold text-slate-800 text-lg border-b pb-2 mb-2">2. Pricing (PKR)</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[12px] font-bold text-slate-600">MRP</label>
                      <input type="number" value={activeEntry.mrp} onChange={e => updateEntry('mrp', e.target.value)} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold" />
                    </div>
                    <div>
                      <label className="text-[12px] font-bold text-slate-600">Actual Selling</label>
                      <input type="number" value={activeEntry.asp} onChange={e => updateEntry('asp', e.target.value)} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold" />
                    </div>
                    <div>
                      <label className="text-[12px] font-bold text-slate-600">Trade Price</label>
                      <input type="number" value={activeEntry.tradePrice} onChange={e => updateEntry('tradePrice', e.target.value)} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold" />
                    </div>
                    <div>
                      <label className="text-[12px] font-bold text-slate-600">Net Cost</label>
                      <input type="number" value={activeEntry.netCost} onChange={e => updateEntry('netCost', e.target.value)} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold" />
                    </div>
                  </div>
                  {activeEntry.mrp && activeEntry.netCost && (
                     <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg flex items-center justify-between">
                       <span className="text-[12px] font-bold text-emerald-800">Margin</span>
                       <span className="text-sm font-bold text-emerald-900">{((parseFloat(activeEntry.mrp) - parseFloat(activeEntry.netCost)) / parseFloat(activeEntry.mrp) * 100).toFixed(1)}%</span>
                     </div>
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div className="flex flex-col gap-4">
                  <h3 className="font-bold text-slate-800 text-lg border-b pb-2 mb-2">3. Commercials</h3>
                  <div>
                    <label className="text-[12px] font-bold text-slate-600">On-Invoice Discount</label>
                    <input type="text" value={activeEntry.onInvoiceDiscountRate} onChange={e => updateEntry('onInvoiceDiscountRate', e.target.value)} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="e.g. 5% or 50 PKR" />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-slate-600">Trade Offer</label>
                    <input type="text" value={activeEntry.tradeOffer} onChange={e => updateEntry('tradeOffer', e.target.value)} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="e.g. 10+1" />
                  </div>
                </div>
              )}
              
              {currentStep === 4 && (
                <div className="flex flex-col gap-4">
                  <h3 className="font-bold text-slate-800 text-lg border-b pb-2 mb-2">4. Stock Availability</h3>
                  <div className="flex gap-2">
                     <button onClick={() => updateEntry('inStock', true)} className={`flex-1 py-3 rounded-lg font-bold text-sm ${activeEntry.inStock === true ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>In Stock</button>
                     <button onClick={() => updateEntry('inStock', false)} className={`flex-1 py-3 rounded-lg font-bold text-sm ${activeEntry.inStock === false ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>OOS</button>
                  </div>
                  {activeEntry.inStock && (
                     <div>
                       <label className="text-[12px] font-bold text-slate-600 mb-2 block">Stock Depth</label>
                       <div className="grid grid-cols-3 gap-2">
                          {['Low', 'Medium', 'High'].map(d => (
                            <button key={d} onClick={() => updateEntry('stockDepth', d)} className={`py-2 rounded-lg text-sm font-bold border transition ${activeEntry.stockDepth === d ? 'bg-sky-100 border-sky-400 text-sky-800' : 'bg-white border-slate-200 text-slate-600'}`}>{d}</button>
                          ))}
                       </div>
                     </div>
                  )}
                </div>
              )}

              {currentStep === 5 && (
                <div className="flex flex-col gap-4">
                  <h3 className="font-bold text-slate-800 text-lg border-b pb-2 mb-2">5. Displays</h3>
                  <div className="grid grid-cols-2 gap-2">
                     {['Floor Stand', 'Countertop Unit', 'Wire Basket', 'Wall Unit', 'Hanger / Strip', 'Customized Fixture', 'OCD / End-Cap'].map(t => (
                        <button key={t} onClick={() => toggleArrayItem('displayTools', t)} className={`p-3 rounded-xl text-left text-[12px] font-bold border transition-colors ${activeEntry.displayTools.includes(t) ? 'bg-sky-600 border-sky-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{t}</button>
                     ))}
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="flex flex-col gap-4">
                  <h3 className="font-bold text-slate-800 text-lg border-b pb-2 mb-2">6. POSM & Marketing</h3>
                  <label className="text-[12px] font-bold text-slate-600">Out-Store POSM</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                     {['Signboard', 'Vinyl Skin'].map(t => (
                        <button key={t} onClick={() => toggleArrayItem('posmOutStore', t)} className={`px-3 py-2 rounded-lg text-left text-[12px] font-bold border transition-colors ${activeEntry.posmOutStore.includes(t) ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-600'}`}>{t}</button>
                     ))}
                  </div>
                  <label className="text-[12px] font-bold text-slate-600">In-Store POSM</label>
                  <div className="flex flex-wrap gap-2">
                     {['Shelf Talker', 'Shelf Fin', 'Wobbler', 'Bunting', 'Shelf Header', 'Poster'].map(t => (
                        <button key={t} onClick={() => toggleArrayItem('posmInStore', t)} className={`px-3 py-2 rounded-lg text-left text-[12px] font-bold border transition-colors ${activeEntry.posmInStore.includes(t) ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-600'}`}>{t}</button>
                     ))}
                  </div>
                </div>
              )}

              {currentStep === 7 && (
                <div className="flex flex-col gap-4">
                  <h3 className="font-bold text-slate-800 text-lg border-b pb-2 mb-2">7. Contracts</h3>
                  <div className="flex gap-2">
                     <button onClick={() => updateEntry('exclusiveAgreement', true)} className={`flex-1 py-3 rounded-lg font-bold text-sm ${activeEntry.exclusiveAgreement === true ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>Exclusive / Rent Paid</button>
                     <button onClick={() => updateEntry('exclusiveAgreement', false)} className={`flex-1 py-3 rounded-lg font-bold text-sm ${activeEntry.exclusiveAgreement === false ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>No Contract</button>
                  </div>
                  {activeEntry.exclusiveAgreement && (
                    <div className="flex flex-col gap-3 mt-2">
                      <div>
                        <label className="text-[12px] font-bold text-slate-600">Shelf Rent (PKR)</label>
                        <input type="number" value={activeEntry.shelfRent} onChange={e => updateEntry('shelfRent', e.target.value)} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold" />
                      </div>
                      <div>
                        <label className="text-[12px] font-bold text-slate-600">Notes</label>
                        <textarea value={activeEntry.exclusivityNotes} onChange={e => updateEntry('exclusivityNotes', e.target.value)} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm h-24"></textarea>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 8 && (
                <div className="flex flex-col gap-4">
                  <h3 className="font-bold text-slate-800 text-lg border-b pb-2 mb-2">8. Evidence Photos</h3>
                  <div className="grid grid-cols-2 gap-3">
                     {['Pack Front', 'Display Tool', 'POSM', 'Store Front'].map(type => {
                       const existing = activeEntry.photos.find(p => p.type === type)
                       return (
                         <div key={type} className="flex flex-col gap-1">
                           <span className="text-[11px] font-bold text-slate-600">{type}</span>
                           <button onClick={() => { setActivePhotoType(type); fileInputRef.current?.click(); }} className={`relative h-24 rounded-xl flex items-center justify-center border-2 border-dashed overflow-hidden ${existing ? 'border-sky-500' : 'border-slate-300 bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                              {existing ? (
                                <img src={existing.base64} alt={type} className="w-full h-full object-cover" />
                              ) : (
                                <span className="material-symbols-outlined text-[28px]">add_a_photo</span>
                              )}
                           </button>
                         </div>
                       )
                     })}
                  </div>
                </div>
              )}

              {/* Navigation within form */}
              <div className="flex justify-between mt-6 pt-4 border-t border-slate-100">
                <button onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1} className="px-4 py-2 text-sm font-bold text-slate-500 disabled:opacity-30">Previous</button>
                {currentStep < 8 ? (
                  <button onClick={() => setCurrentStep(currentStep + 1)} className="px-6 py-2 bg-sky-600 text-white text-sm font-bold rounded-lg shadow-sm">Next</button>
                ) : (
                  <button onClick={() => setCurrentEntryIdx(-1)} className="px-6 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg shadow-sm">Done</button>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handlePhotoCapture} />

      {entries.length > 0 && currentEntryIdx === -1 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-lg">
          <button onClick={submitReport} disabled={saving || !loaded || !outletCode} className="w-full h-12 bg-slate-900 text-white font-bold rounded-xl shadow-md disabled:opacity-70 flex items-center justify-center gap-2">
            {saving ? 'Submitting...' : 'Submit Final Report'}
            <span className="material-symbols-outlined text-[20px]">upload</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default function CompetitorIntelligence() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-slate-500 font-sans">Loading...</div>}>
      <CompetitorIntelligenceForm />
    </Suspense>
  )
}
