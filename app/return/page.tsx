'use client'
import { useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import PrintReturnNote from '../../components/PrintReturnNote'

// ─── Product Master (mirrors order/page.tsx) ─────────────────────────────────
interface Product {
  code: string; name: string; gm: number; pcsPerCtn: number; tp: number; category: string
}

const PRODUCTS: Product[] = [
  { code: 'SKU00011', name: 'DAAL SEV 16g', gm: 16, pcsPerCtn: 72, tp: 14.75, category: 'Nimko' },
  { code: 'SKU00001', name: 'POTATO STICK (CHATPATA) 16g', gm: 16, pcsPerCtn: 72, tp: 14.75, category: 'Potato Sticks' },
  { code: 'SKU00030', name: 'SPICY MIX NIMKO 16g', gm: 16, pcsPerCtn: 72, tp: 14.75, category: 'Nimko' },
  { code: 'SKU00021', name: 'NIMBOO DAAL 16g', gm: 16, pcsPerCtn: 72, tp: 14.75, category: 'Nimko' },
  { code: 'SKU00023', name: 'NIMKO MIX HOT & SPICY 16g', gm: 16, pcsPerCtn: 72, tp: 14.75, category: 'Nimko' },
  { code: 'SKU00024', name: 'NIMKO MIX LEMON & CHILLI 16g', gm: 16, pcsPerCtn: 72, tp: 14.75, category: 'Nimko' },
  { code: 'SKU00003', name: 'MUNCHY (SALTED) 10g', gm: 10, pcsPerCtn: 48, tp: 14.75, category: 'Munchy' },
  { code: 'SKU00005', name: 'MUNCHY (VEGETABLE EU) 10g', gm: 10, pcsPerCtn: 48, tp: 14.75, category: 'Munchy' },
  { code: 'SKU00037', name: 'DAAL SEV Box 192g', gm: 192, pcsPerCtn: 12, tp: 177.05, category: 'Nimko' },
  { code: 'SKU00038', name: 'POTATO STICK Box 192g', gm: 192, pcsPerCtn: 12, tp: 177.05, category: 'Potato Sticks' },
  { code: 'SKU00068', name: 'SPICY MIX NIMKO Box 192g', gm: 192, pcsPerCtn: 12, tp: 177.05, category: 'Nimko' },
  { code: 'SKU00039', name: 'NIMBOO DAAL Box 192g', gm: 192, pcsPerCtn: 12, tp: 177.05, category: 'Nimko' },
  { code: 'SKU00040', name: 'NIMKO MIX HOT & SPICY Box 192g', gm: 192, pcsPerCtn: 12, tp: 177.05, category: 'Nimko' },
  { code: 'SKU00041', name: 'NIMKO MIX LEMON & CHILLI Box 192g', gm: 192, pcsPerCtn: 12, tp: 177.05, category: 'Nimko' },
  { code: 'SKU00020', name: 'NIMBOO DAAL 24g', gm: 24, pcsPerCtn: 48, tp: 22.13, category: 'Nimko' },
  { code: 'SKU00009', name: 'DAAL MOUNG 18g', gm: 18, pcsPerCtn: 72, tp: 22.13, category: 'Daal' },
  { code: 'SKU00042', name: 'DAAL MOUNG Box 216g', gm: 216, pcsPerCtn: 12, tp: 265.57, category: 'Daal' },
  { code: 'SKU00050', name: 'NIMKO MIX HOT & SPICY 24g', gm: 24, pcsPerCtn: 48, tp: 22.13, category: 'Nimko' },
  { code: 'SKU00002', name: 'POTATO STICK (S&P) 24g', gm: 24, pcsPerCtn: 48, tp: 22.13, category: 'Potato Sticks' },
  { code: 'SKU00034', name: 'SALTED PEANUT 16g', gm: 16, pcsPerCtn: 84, tp: 22.13, category: 'Peanuts' },
  { code: 'SKU00031', name: 'PEANUT UNSALTED 16g', gm: 16, pcsPerCtn: 84, tp: 22.13, category: 'Peanuts' },
  { code: 'SKU00051', name: 'NIMKO MIX LEMON & CHILLI 24g', gm: 24, pcsPerCtn: 48, tp: 22.13, category: 'Nimko' },
  { code: 'SKU00007', name: 'SPICY MIX NIMKO 24g', gm: 24, pcsPerCtn: 48, tp: 22.13, category: 'Nimko' },
  { code: 'SKU00012', name: 'DAAL SEV 24g', gm: 24, pcsPerCtn: 48, tp: 22.13, category: 'Nimko' },
  { code: 'SKU00004', name: 'MUNCHY (SALTED) 15g', gm: 15, pcsPerCtn: 36, tp: 22.13, category: 'Munchy' },
  { code: 'SKU00006', name: 'MUNCHY (VEGETABLE EU) 15g', gm: 15, pcsPerCtn: 36, tp: 22.13, category: 'Munchy' },
  { code: 'SKU00025', name: 'NIMKO SALT & PEPPER 40g', gm: 40, pcsPerCtn: 36, tp: 36.89, category: 'Nimko' },
  { code: 'SKU00008', name: 'CHEWRA NIMKO 30g', gm: 30, pcsPerCtn: 36, tp: 36.89, category: 'Nimko' },
  { code: 'SKU00010', name: 'DAAL MOUNG 30g', gm: 30, pcsPerCtn: 48, tp: 36.89, category: 'Daal' },
  { code: 'SKU00035', name: 'SALTED PEANUT 25g', gm: 25, pcsPerCtn: 48, tp: 36.89, category: 'Peanuts' },
  { code: 'SKU00032', name: 'PEANUT UNSALTED 25g', gm: 25, pcsPerCtn: 48, tp: 36.89, category: 'Peanuts' },
  { code: 'SKU00014', name: 'KHAT MITHA 30g', gm: 30, pcsPerCtn: 36, tp: 36.89, category: 'Nimko' },
  { code: 'SKU00013', name: 'KARACHI NIMCO MIX 40g', gm: 40, pcsPerCtn: 36, tp: 36.89, category: 'Nimko' },
  { code: 'SKU00056', name: 'MUNCHY (SALTED) 25g', gm: 25, pcsPerCtn: 24, tp: 36.89, category: 'Munchy' },
  { code: 'SKU00069', name: 'MUNCHY (VEGETABLE EU) 25g', gm: 25, pcsPerCtn: 24, tp: 36.89, category: 'Munchy' },
  { code: 'SKU00036', name: 'SALTED PEANUT 40g', gm: 40, pcsPerCtn: 36, tp: 59.02, category: 'Peanuts' },
  { code: 'SKU00033', name: 'PEANUT UNSALTED 40g', gm: 40, pcsPerCtn: 36, tp: 59.02, category: 'Peanuts' },
  { code: 'SKU00029', name: 'SHAHI MIX 80g', gm: 80, pcsPerCtn: 36, tp: 184.43, category: 'Premium' },
  { code: 'SKU00016', name: 'LAHORI MIX 80g', gm: 80, pcsPerCtn: 36, tp: 132.79, category: 'Premium' },
  { code: 'SKU00054', name: 'NIMKO SALT & PEPPER 80g', gm: 80, pcsPerCtn: 36, tp: 88.52, category: 'Nimko' },
  { code: 'SKU00028', name: 'SHAHI MIX 180g', gm: 180, pcsPerCtn: 30, tp: 368.85, category: 'Premium' },
  { code: 'SKU00015', name: 'LAHORI MIX 180g', gm: 180, pcsPerCtn: 30, tp: 295.08, category: 'Premium' },
  { code: 'SKU00052', name: 'LEMON & CHILLI 180g', gm: 180, pcsPerCtn: 30, tp: 199.18, category: 'Nimko' },
  { code: 'SKU00019', name: 'MASOOR MASALA 180g', gm: 180, pcsPerCtn: 30, tp: 199.18, category: 'Nimko' },
  { code: 'SKU00053', name: 'NIMKO SALT & PEPPER 180g', gm: 180, pcsPerCtn: 30, tp: 199.18, category: 'Nimko' },
  { code: 'SKU00064', name: 'DAAL SEV Strip 16g', gm: 16, pcsPerCtn: 72, tp: 14.75, category: 'Nimko' },
  { code: 'SKU00058', name: 'POTATO STICK Strip 16g', gm: 16, pcsPerCtn: 72, tp: 14.75, category: 'Potato Sticks' },
  { code: 'SKU00059', name: 'SPICY MIX NIMKO Strip 16g', gm: 16, pcsPerCtn: 72, tp: 14.75, category: 'Nimko' },
  { code: 'SKU00060', name: 'NIMBOO DAAL Strip 16g', gm: 16, pcsPerCtn: 72, tp: 14.75, category: 'Nimko' },
  { code: 'SKU00061', name: 'NIMKO MIX HOT & SPICY Strip 16g', gm: 16, pcsPerCtn: 72, tp: 14.75, category: 'Nimko' },
  { code: 'SKU00062', name: 'NIMKO MIX LEMON & CHILLI Strip 16g', gm: 16, pcsPerCtn: 72, tp: 14.75, category: 'Nimko' },
  { code: 'SKU00063', name: 'DAAL MOUNG Strip 18g', gm: 18, pcsPerCtn: 72, tp: 22.13, category: 'Daal' },
  { code: 'SKU00065', name: 'MASALA PEANUT 16g', gm: 16, pcsPerCtn: 84, tp: 22.13, category: 'Peanuts' },
  { code: 'SKU00066', name: 'MASALA PEANUT 25g', gm: 25, pcsPerCtn: 48, tp: 36.89, category: 'Peanuts' },
  { code: 'SKU00067', name: 'MASALA PEANUT 40g', gm: 40, pcsPerCtn: 36, tp: 59.02, category: 'Peanuts' },
]

const CATEGORIES = ['All', 'Nimko', 'Peanuts', 'Munchy', 'Daal', 'Potato Sticks', 'Premium']
const CONDITIONS = ['Expired', 'Damaged', 'Near Expiry'] as const
type ReturnCondition = typeof CONDITIONS[number]

// ─── Cart Item ────────────────────────────────────────────────────────────────
interface ReturnCartItem {
  id: string
  product: Product
  qty: number
  uom: 'CTN' | 'PCS'
  condition: ReturnCondition | ''
  batch: string
  invoiceRef: string
}

const CONDITION_STYLES: Record<string, string> = {
  'Expired': 'bg-red-50 border-red-300 text-red-700',
  'Damaged': 'bg-amber-50 border-amber-300 text-amber-700',
  'Near Expiry': 'bg-violet-50 border-violet-300 text-violet-700',
}
const CONDITION_ACTIVE: Record<string, string> = {
  'Expired': 'bg-red-600 border-red-600 text-white shadow-md',
  'Damaged': 'bg-amber-500 border-amber-500 text-white shadow-md',
  'Near Expiry': 'bg-violet-600 border-violet-600 text-white shadow-md',
}

// ─── Main Inner Component ─────────────────────────────────────────────────────
function ReturnFormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const outletId = searchParams.get('id')
  const outletNameParam = decodeURIComponent(searchParams.get('outletName') || '')
  const outletCodeParam = searchParams.get('outletCode') || ''
  const pjpNameParam = decodeURIComponent(searchParams.get('pjp') || '')

  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const draftId = 'RTN-DRAFT-' + Math.floor(1000 + Math.random() * 9000)

  type View = 'return' | 'picker' | 'success' | 'print'
  const [view, setView] = useState<View>('return')
  const [cart, setCart] = useState<ReturnCartItem[]>([])
  const [catFilter, setCatFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [returnId, setReturnId] = useState('')

  // Outlet name comes from URL params (same pattern as order page)
  const outletName = outletNameParam || 'Unknown Outlet'
  const outletCode = outletCodeParam
  const pjpName = pjpNameParam

  const filteredProducts = useMemo(() => PRODUCTS.filter(p => {
    const matchCat = catFilter === 'All' || p.category === catFilter
    const term = search.toLowerCase()
    const matchSearch = !term || p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term)
    return matchCat && matchSearch
  }), [catFilter, search])

  function addToCart(p: Product) {
    setCart(prev => {
      const exists = prev.find(c => c.product.code === p.code)
      if (exists) return prev  // don't duplicate; user adjusts on main screen
      return [...prev, { id: p.code + Date.now(), product: p, qty: 1, uom: 'CTN', condition: '', batch: '', invoiceRef: '' }]
    })
    setView('return')
  }

  function removeFromCart(id: string) {
    setCart(prev => prev.filter(c => c.id !== id))
  }

  function adjustQty(id: string, delta: number) {
    setCart(prev => prev.map(c => {
      if (c.id !== id) return c
      return { ...c, qty: Math.max(1, c.qty + delta) }
    }))
  }

  function setQty(id: string, val: string) {
    const n = parseInt(val)
    if (!isNaN(n) && n > 0) setCart(prev => prev.map(c => c.id === id ? { ...c, qty: n } : c))
  }

  function setUom(id: string, uom: 'CTN' | 'PCS') {
    setCart(prev => prev.map(c => c.id === id ? { ...c, uom } : c))
  }

  function setCondition(id: string, condition: ReturnCondition) {
    setCart(prev => prev.map(c => c.id === id ? { ...c, condition } : c))
  }

  function setField(id: string, field: 'batch' | 'invoiceRef', val: string) {
    setCart(prev => prev.map(c => c.id === id ? { ...c, [field]: val } : c))
  }

  const Rs = (n: number) => 'Rs ' + n.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  const totalUnits = cart.reduce((s, c) => s + (c.uom === 'CTN' ? c.qty * c.product.pcsPerCtn : c.qty), 0)
  const totalValue = cart.reduce((s, c) => {
    const units = c.uom === 'CTN' ? c.qty * c.product.pcsPerCtn : c.qty
    return s + units * c.product.tp
  }, 0)

  const missingCondition = cart.some(c => !c.condition)

  async function handleSubmitClaim() {
    if (cart.length === 0) { alert('Please add at least one product.'); return }
    if (missingCondition) { alert('Please select a Return Condition for every item before submitting.'); return }
    setSubmitting(true)
    const id = 'RTN-' + String(Math.floor(100000 + Math.random() * 900000))
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.id) {
        await supabase.from('sales_returns').insert({
          claim_id: id,
          outlet_id: outletId,
          order_booker_id: session.user.id,
          total_ctn: cart.filter(c => c.uom === 'CTN').reduce((s, c) => s + c.qty, 0),
          total_pcs: cart.filter(c => c.uom === 'PCS').reduce((s, c) => s + c.qty, 0),
          items: cart.map(c => ({
            code: c.product.code,
            name: c.product.name,
            qty: c.qty,
            uom: c.uom,
            condition: c.condition,
            batch: c.batch,
            invoiceRef: c.invoiceRef,
          })),
        })
        await supabase.from('outlet_visits').upsert({
          outlet_id: outletId,
          order_booker_id: session.user.id,
          visit_date: new Date().toISOString().slice(0, 10),
          status: 'returned',
          visited_at: new Date().toISOString(),
        }, { onConflict: 'outlet_id,visit_date' })
      }
      setReturnId(id)
      setView('success')
    } catch (err) {
      console.error(err)
      alert('Failed to submit claim. Please retry.')
      setSubmitting(false)
    }
  }

  // ─── PRINT VIEW ───────────────────────────────────────────────────────────
  if (view === 'print') return (
    <PrintReturnNote
      returnId={returnId || draftId}
      outletName={outletName}
      outletCode={outletCode}
      pjpName={pjpName}
      lines={cart.map(c => ({
        id: c.id,
        product: c.product,
        qty: c.qty,
        uom: c.uom,
        condition: c.condition as ReturnCondition,
        batch: c.batch,
        invoiceRef: c.invoiceRef,
      }))}
      onBack={() => setView(returnId ? 'success' : 'return')}
    />
  )

  // ─── SUCCESS VIEW ─────────────────────────────────────────────────────────
  if (view === 'success') return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#f1f5f9] items-center justify-center p-8 text-center">
      <div className="w-24 h-24 rounded-full bg-orange-500/20 border-2 border-orange-500/40 flex items-center justify-center mb-6 shadow-inner">
        <span className="material-symbols-outlined text-5xl text-orange-600" style={{ fontVariationSettings: "'FILL' 1" }}>assignment_return</span>
      </div>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 font-bold text-xs rounded-full border border-orange-200 mb-4">
        <span className="material-symbols-outlined text-[14px]">verified</span>
        Return Claim Submitted
      </div>
      <h1 className="text-2xl font-extrabold text-slate-900 mb-1">{returnId}</h1>
      <p className="text-sm text-slate-500 mb-1">{outletName}</p>
      <p className="text-2xl font-extrabold font-mono text-slate-900">{Rs(totalValue)}</p>
      <p className="text-xs text-slate-400 mt-1 mb-8">{totalUnits} Units · {cart.length} SKUs · {today}</p>
      <div className="flex flex-col gap-3 w-full">
        <div className="flex gap-3 w-full">
          <button onClick={() => router.push('/')} className="flex-1 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">home</span> Back
          </button>
          <button onClick={() => { setCart([]); setReturnId(''); setView('return') }} className="flex-1 py-3.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">add</span> New
          </button>
        </div>
        <button onClick={() => setView('print')} className="w-full py-3.5 bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition border border-sky-200">
          <span className="material-symbols-outlined text-[18px]">print</span> Print / Save Claim Note
        </button>
      </div>
    </div>
  )

  // ─── PRODUCT PICKER VIEW (mirrors order/page.tsx picker) ─────────────────
  if (view === 'picker') return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white">
      <div className="bg-[#071326] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <button onClick={() => setView('return')} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <div>
            <h2 className="text-sm font-bold">Product Catalog</h2>
            <p className="text-[10px] text-slate-300">Tap card to add to return list</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-orange-900/60 text-orange-200 text-[10px] font-mono">Return List</span>
      </div>

      {/* Search */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
          <input type="text" placeholder="Search by SKU, name, grams..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[11px] font-bold">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-2.5 py-1 rounded-full shrink-0 transition ${catFilter === c ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Product list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredProducts.map(p => {
          const inCart = cart.find(c => c.product.code === p.code)
          return (
            <div key={p.code} onClick={() => addToCart(p)}
              className="bg-white hover:bg-orange-50/40 p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.99] transition">
              <div className="space-y-0.5 flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-900 truncate">{p.name}</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[9px] shrink-0">{p.code}</span>
                </div>
                <div className="text-[10px] text-slate-500">{p.pcsPerCtn} pcs/ctn · {p.category}</div>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[11px] font-bold text-slate-900 font-mono">Rs {p.tp} (Ex-GST) <span className="text-[9px] font-normal text-slate-500">/unit</span></span>
                </div>
              </div>
              <button className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 border transition ${inCart ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                <span className="material-symbols-outlined text-[18px]">{inCart ? 'check' : 'add'}</span>
              </button>
            </div>
          )
        })}
      </div>

      <div className="p-3 bg-white border-t border-slate-200">
        <button onClick={() => setView('return')}
          className="w-full h-11 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition">
          <span className="material-symbols-outlined text-[18px]">assignment_return</span>
          View Return List ({cart.length} Items)
        </button>
      </div>
    </div>
  )

  // ─── MAIN RETURN SCREEN (mirrors order/page.tsx main order view) ──────────
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#f1f5f9] relative overflow-hidden">
      {/* Header — same dark navy as order form */}
      <div className="bg-[#071326] text-white px-4 py-2.5 shadow-md flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight">Sales Return</h1>
              <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-300 text-[10px] font-medium rounded border border-orange-500/30">Claim</span>
            </div>
            <p className="text-[10px] text-slate-300 font-mono">{draftId} · {today}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => cart.length > 0 && setView('print')} title="Print Preview" className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-200">
            <span className="material-symbols-outlined text-[20px]">print</span>
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-28">

        {/* Outlet Card — same as order form */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-orange-50 rounded-full pointer-events-none"></div>
          <div className="flex items-start justify-between relative">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#0f294a] text-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>assignment_return</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 leading-tight">{outletName}</h2>
                <p className="text-[11px] text-slate-500 font-medium">{outletCode}{pjpName ? ` · ${pjpName}` : ''}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add products button — same style as order form */}
        <button onClick={() => setView('picker')}
          className="w-full h-12 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 border border-orange-500 active:scale-[0.98] transition">
          <span className="material-symbols-outlined text-[22px]">add_circle</span>
          <span>＋ Add Products from Catalog</span>
          <span className="px-2 py-0.5 bg-white/20 text-white rounded text-[11px] font-mono font-semibold ml-1">{PRODUCTS.length} SKUs</span>
        </button>

        {/* Cart items */}
        {cart.length > 0 && (
          <>
            <div className="flex items-center justify-between px-1 pt-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-700">Return Items</h3>
                <span className="px-1.5 py-0.2 rounded-full bg-orange-100 text-orange-800 font-bold text-[10px]">
                  {cart.length} Products · {totalUnits} Units
                </span>
              </div>
              <button onClick={() => setView('picker')} className="text-orange-600 font-bold text-xs flex items-center gap-0.5 hover:underline">
                <span className="material-symbols-outlined text-[15px]">add</span> Add More
              </button>
            </div>

            {cart.map(item => {
              const units = item.uom === 'CTN' ? item.qty * item.product.pcsPerCtn : item.qty
              const lineVal = units * item.product.tp
              const conditionSet = !!item.condition
              return (
                <div key={item.id} className={`bg-white rounded-xl p-3 border shadow-sm relative space-y-2.5 ${conditionSet ? 'border-slate-200' : 'border-red-200 ring-1 ring-red-100'}`}>
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div className="pr-6">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-[13px] font-bold text-slate-900">{item.product.name}</h4>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-mono font-semibold">{item.product.code}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-50 text-slate-500 text-[9.5px]">{item.product.pcsPerCtn} pcs/ctn</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">TP: Rs {item.product.tp}/unit · {item.product.category}</div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition absolute top-2 right-2">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>

                  {/* ── RETURN CONDITION — MANDATORY ── */}
                  <div>
                    <div className="flex items-center gap-1 mb-1.5">
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Return Condition</span>
                      {!conditionSet && (
                        <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">Required</span>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      {CONDITIONS.map(cond => (
                        <button key={cond}
                          onClick={() => setCondition(item.id, cond)}
                          className={`flex-1 py-1.5 px-1 rounded-lg border text-[10px] font-bold text-center transition active:scale-95 ${item.condition === cond ? CONDITION_ACTIVE[cond] : CONDITION_STYLES[cond]}`}>
                          {cond}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Qty stepper — same as order form */}
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-[10px] font-bold">
                      <button onClick={() => setUom(item.id, 'CTN')}
                        className={`px-2 py-1 rounded-md transition ${item.uom === 'CTN' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
                        Cartons
                      </button>
                      <button onClick={() => setUom(item.id, 'PCS')}
                        className={`px-2 py-1 rounded-md transition ${item.uom === 'PCS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
                        Units
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => adjustQty(item.id, -1)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-700 font-bold text-lg flex items-center justify-center active:bg-slate-100 active:scale-95 transition">−</button>
                      <input type="number" value={item.qty} onChange={e => setQty(item.id, e.target.value)}
                        className="w-12 h-8 text-center font-mono font-bold text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                      <button onClick={() => adjustQty(item.id, 1)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-700 font-bold text-lg flex items-center justify-center active:bg-slate-100 active:scale-95 transition">+</button>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-semibold text-slate-600 bg-white px-2 py-1 rounded border border-slate-200 block">
                        {item.uom === 'CTN' ? `${units} units` : `${(item.qty / item.product.pcsPerCtn).toFixed(2)} ctns`}
                      </span>
                    </div>
                  </div>

                  {/* Optional fields: Batch + Invoice Ref */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase">Batch No. <span className="font-normal text-slate-400">(opt.)</span></label>
                      <input type="text" value={item.batch} onChange={e => setField(item.id, 'batch', e.target.value)}
                        placeholder="e.g. B2024-06"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase">Invoice Ref. <span className="font-normal text-slate-400">(opt.)</span></label>
                      <input type="text" value={item.invoiceRef} onChange={e => setField(item.id, 'invoiceRef', e.target.value)}
                        placeholder="e.g. INV-100123"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium" />
                    </div>
                  </div>

                  {/* Financial footer */}
                  <div className="flex flex-wrap items-end justify-between gap-x-2 gap-y-1.5 pt-1.5 text-[10px] border-t border-slate-100 text-slate-500 font-medium">
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-[9px] leading-tight">TP/Unit</span>
                      <span className="font-mono text-slate-700">{item.product.tp}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-[9px] leading-tight">Units</span>
                      <span className="font-mono text-slate-700">{units}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-slate-400 text-[9px] leading-tight">Claim Value (Ex-GST)</span>
                      <span className="font-mono font-bold text-slate-900">{Rs(lineVal)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* Notes field */}
        <div className="bg-white rounded-xl p-2.5 border border-slate-200 text-[11px] space-y-1">
          <label className="font-semibold text-slate-700 flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-slate-400">edit_note</span>
            Claim Remarks (Optional)
          </label>
          <input type="text" placeholder="e.g. Distributor informed, goods to be collected Monday"
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
      </div>

      {/* Sticky bottom bar — same pattern as order form */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-3 py-2.5 shadow-2xl z-30 flex items-center justify-between gap-3">
        <div className="flex-1">
          {missingCondition && cart.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-red-600 font-bold mb-0.5">
              <span className="material-symbols-outlined text-[13px]">warning</span>
              <span>Select condition on all items</span>
            </div>
          )}
          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Claim Value:</span>
            <span className="text-base font-extrabold font-mono text-slate-950">{Rs(totalValue)}</span>
          </div>
          <span className="text-[9.5px] text-slate-400">{totalUnits} Units · {cart.length} SKUs</span>
        </div>

        <button
          onClick={handleSubmitClaim}
          disabled={cart.length === 0 || missingCondition || submitting}
          className={`h-11 px-4 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition shrink-0 ${cart.length > 0 && !missingCondition ? 'bg-slate-900 hover:bg-black text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
          {submitting
            ? <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
            : <><span>Submit Claim</span><span className="material-symbols-outlined text-[16px]">send</span></>}
        </button>
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
