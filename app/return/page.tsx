'use client'
import { useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import PrintReturnNote from '../../components/PrintReturnNote'

// ─── Product Master (exact copy of order/page.tsx PRODUCTS, with all offer fields) ──
interface Product {
  code: string; name: string; gm: number; pcsPerCtn: number
  tp: number
  gtOffer: number; mtOffer: number; wsOffer: number
  category: string
}

const PRODUCTS: Product[] = [
  { code: 'SKU00011', name: 'DAAL SEV 16g', gm: 16, pcsPerCtn: 72, tp: 14.75, gtOffer: 2.5, mtOffer: 3.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00001', name: 'POTATO STICK (CHATPATA) 16g', gm: 16, pcsPerCtn: 72, tp: 14.75, gtOffer: 2.0, mtOffer: 2.5, wsOffer: 0.0, category: 'Potato Sticks' },
  { code: 'SKU00030', name: 'SPICY MIX NIMKO 16g', gm: 16, pcsPerCtn: 72, tp: 14.75, gtOffer: 2.5, mtOffer: 3.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00021', name: 'NIMBOO DAAL 16g', gm: 16, pcsPerCtn: 72, tp: 14.75, gtOffer: 2.5, mtOffer: 3.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00023', name: 'NIMKO MIX HOT & SPICY 16g', gm: 16, pcsPerCtn: 72, tp: 14.75, gtOffer: 2.0, mtOffer: 2.5, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00024', name: 'NIMKO MIX LEMON & CHILLI 16g', gm: 16, pcsPerCtn: 72, tp: 14.75, gtOffer: 2.0, mtOffer: 2.5, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00003', name: 'MUNCHY (SALTED) 10g', gm: 10, pcsPerCtn: 48, tp: 14.75, gtOffer: 10.0, mtOffer: 0.0, wsOffer: 15.0, category: 'Munchy' },
  { code: 'SKU00005', name: 'MUNCHY (VEGETABLE EU) 10g', gm: 10, pcsPerCtn: 48, tp: 14.75, gtOffer: 10.0, mtOffer: 0.0, wsOffer: 15.0, category: 'Munchy' },
  { code: 'SKU00037', name: 'DAAL SEV Box 192g', gm: 192, pcsPerCtn: 12, tp: 177.05, gtOffer: 9.5, mtOffer: 0.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00038', name: 'POTATO STICK Box 192g', gm: 192, pcsPerCtn: 12, tp: 177.05, gtOffer: 9.5, mtOffer: 0.0, wsOffer: 0.0, category: 'Potato Sticks' },
  { code: 'SKU00068', name: 'SPICY MIX NIMKO Box 192g', gm: 192, pcsPerCtn: 12, tp: 177.05, gtOffer: 9.5, mtOffer: 0.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00039', name: 'NIMBOO DAAL Box 192g', gm: 192, pcsPerCtn: 12, tp: 177.05, gtOffer: 9.5, mtOffer: 0.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00040', name: 'NIMKO MIX HOT & SPICY Box 192g', gm: 192, pcsPerCtn: 12, tp: 177.05, gtOffer: 9.5, mtOffer: 0.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00041', name: 'NIMKO MIX LEMON & CHILLI Box 192g', gm: 192, pcsPerCtn: 12, tp: 177.05, gtOffer: 9.5, mtOffer: 0.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00020', name: 'NIMBOO DAAL 24g', gm: 24, pcsPerCtn: 48, tp: 22.13, gtOffer: 3.0, mtOffer: 3.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00009', name: 'DAAL MOUNG 18g', gm: 18, pcsPerCtn: 72, tp: 22.13, gtOffer: 2.5, mtOffer: 3.0, wsOffer: 0.0, category: 'Daal' },
  { code: 'SKU00042', name: 'DAAL MOUNG Box 216g', gm: 216, pcsPerCtn: 12, tp: 265.57, gtOffer: 9.5, mtOffer: 0.0, wsOffer: 0.0, category: 'Daal' },
  { code: 'SKU00050', name: 'NIMKO MIX HOT & SPICY 24g', gm: 24, pcsPerCtn: 48, tp: 22.13, gtOffer: 3.0, mtOffer: 3.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00002', name: 'POTATO STICK (S&P) 24g', gm: 24, pcsPerCtn: 48, tp: 22.13, gtOffer: 3.0, mtOffer: 3.0, wsOffer: 0.0, category: 'Potato Sticks' },
  { code: 'SKU00034', name: 'SALTED PEANUT 16g', gm: 16, pcsPerCtn: 84, tp: 22.13, gtOffer: 2.5, mtOffer: 0.0, wsOffer: 0.0, category: 'Peanuts' },
  { code: 'SKU00031', name: 'PEANUT UNSALTED 16g', gm: 16, pcsPerCtn: 84, tp: 22.13, gtOffer: 2.5, mtOffer: 0.0, wsOffer: 0.0, category: 'Peanuts' },
  { code: 'SKU00051', name: 'NIMKO MIX LEMON & CHILLI 24g', gm: 24, pcsPerCtn: 48, tp: 22.13, gtOffer: 3.0, mtOffer: 3.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00007', name: 'SPICY MIX NIMKO 24g', gm: 24, pcsPerCtn: 48, tp: 22.13, gtOffer: 3.0, mtOffer: 3.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00012', name: 'DAAL SEV 24g', gm: 24, pcsPerCtn: 48, tp: 22.13, gtOffer: 3.0, mtOffer: 3.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00004', name: 'MUNCHY (SALTED) 15g', gm: 15, pcsPerCtn: 36, tp: 22.13, gtOffer: 2.5, mtOffer: 2.5, wsOffer: 0.0, category: 'Munchy' },
  { code: 'SKU00006', name: 'MUNCHY (VEGETABLE EU) 15g', gm: 15, pcsPerCtn: 36, tp: 22.13, gtOffer: 2.5, mtOffer: 2.5, wsOffer: 0.0, category: 'Munchy' },
  { code: 'SKU00025', name: 'NIMKO SALT & PEPPER 40g', gm: 40, pcsPerCtn: 36, tp: 36.89, gtOffer: 3.0, mtOffer: 3.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00008', name: 'CHEWRA NIMKO 30g', gm: 30, pcsPerCtn: 36, tp: 36.89, gtOffer: 3.0, mtOffer: 3.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00010', name: 'DAAL MOUNG 30g', gm: 30, pcsPerCtn: 48, tp: 36.89, gtOffer: 3.0, mtOffer: 3.0, wsOffer: 0.0, category: 'Daal' },
  { code: 'SKU00035', name: 'SALTED PEANUT 25g', gm: 25, pcsPerCtn: 48, tp: 36.89, gtOffer: 2.5, mtOffer: 2.5, wsOffer: 0.0, category: 'Peanuts' },
  { code: 'SKU00032', name: 'PEANUT UNSALTED 25g', gm: 25, pcsPerCtn: 48, tp: 36.89, gtOffer: 2.5, mtOffer: 2.5, wsOffer: 0.0, category: 'Peanuts' },
  { code: 'SKU00014', name: 'KHAT MITHA 30g', gm: 30, pcsPerCtn: 36, tp: 36.89, gtOffer: 3.0, mtOffer: 3.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00013', name: 'KARACHI NIMCO MIX 40g', gm: 40, pcsPerCtn: 36, tp: 36.89, gtOffer: 3.0, mtOffer: 3.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00056', name: 'MUNCHY (SALTED) 25g', gm: 25, pcsPerCtn: 24, tp: 36.89, gtOffer: 2.5, mtOffer: 2.5, wsOffer: 0.0, category: 'Munchy' },
  { code: 'SKU00069', name: 'MUNCHY (VEGETABLE EU) 25g', gm: 25, pcsPerCtn: 24, tp: 36.89, gtOffer: 2.5, mtOffer: 2.5, wsOffer: 0.0, category: 'Munchy' },
  { code: 'SKU00036', name: 'SALTED PEANUT 40g', gm: 40, pcsPerCtn: 36, tp: 59.02, gtOffer: 2.5, mtOffer: 2.5, wsOffer: 0.0, category: 'Peanuts' },
  { code: 'SKU00033', name: 'PEANUT UNSALTED 40g', gm: 40, pcsPerCtn: 36, tp: 59.02, gtOffer: 2.5, mtOffer: 2.5, wsOffer: 0.0, category: 'Peanuts' },
  { code: 'SKU00029', name: 'SHAHI MIX 80g', gm: 80, pcsPerCtn: 36, tp: 184.43, gtOffer: 2.5, mtOffer: 3.0, wsOffer: 0.0, category: 'Premium' },
  { code: 'SKU00016', name: 'LAHORI MIX 80g', gm: 80, pcsPerCtn: 36, tp: 132.79, gtOffer: 2.5, mtOffer: 3.0, wsOffer: 0.0, category: 'Premium' },
  { code: 'SKU00054', name: 'NIMKO SALT & PEPPER 80g', gm: 80, pcsPerCtn: 36, tp: 88.52, gtOffer: 2.5, mtOffer: 3.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00028', name: 'SHAHI MIX 180g', gm: 180, pcsPerCtn: 30, tp: 368.85, gtOffer: 2.5, mtOffer: 3.0, wsOffer: 0.0, category: 'Premium' },
  { code: 'SKU00015', name: 'LAHORI MIX 180g', gm: 180, pcsPerCtn: 30, tp: 295.08, gtOffer: 2.5, mtOffer: 3.0, wsOffer: 0.0, category: 'Premium' },
  { code: 'SKU00052', name: 'LEMON & CHILLI 180g', gm: 180, pcsPerCtn: 30, tp: 199.18, gtOffer: 2.5, mtOffer: 3.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00019', name: 'MASOOR MASALA 180g', gm: 180, pcsPerCtn: 30, tp: 199.18, gtOffer: 2.5, mtOffer: 3.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00053', name: 'NIMKO SALT & PEPPER 180g', gm: 180, pcsPerCtn: 30, tp: 199.18, gtOffer: 2.5, mtOffer: 3.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00064', name: 'DAAL SEV Strip 16g', gm: 16, pcsPerCtn: 72, tp: 14.75, gtOffer: 8.0, mtOffer: 0.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00058', name: 'POTATO STICK Strip 16g', gm: 16, pcsPerCtn: 72, tp: 14.75, gtOffer: 8.0, mtOffer: 0.0, wsOffer: 0.0, category: 'Potato Sticks' },
  { code: 'SKU00059', name: 'SPICY MIX NIMKO Strip 16g', gm: 16, pcsPerCtn: 72, tp: 14.75, gtOffer: 8.0, mtOffer: 0.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00060', name: 'NIMBOO DAAL Strip 16g', gm: 16, pcsPerCtn: 72, tp: 14.75, gtOffer: 8.0, mtOffer: 0.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00061', name: 'NIMKO MIX HOT & SPICY Strip 16g', gm: 16, pcsPerCtn: 72, tp: 14.75, gtOffer: 8.0, mtOffer: 0.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00062', name: 'NIMKO MIX LEMON & CHILLI Strip 16g', gm: 16, pcsPerCtn: 72, tp: 14.75, gtOffer: 8.0, mtOffer: 0.0, wsOffer: 0.0, category: 'Nimko' },
  { code: 'SKU00063', name: 'DAAL MOUNG Strip 18g', gm: 18, pcsPerCtn: 72, tp: 22.13, gtOffer: 8.0, mtOffer: 0.0, wsOffer: 0.0, category: 'Daal' },
  { code: 'SKU00065', name: 'MASALA PEANUT 16g', gm: 16, pcsPerCtn: 84, tp: 22.13, gtOffer: 2.5, mtOffer: 0.0, wsOffer: 0.0, category: 'Peanuts' },
  { code: 'SKU00066', name: 'MASALA PEANUT 25g', gm: 25, pcsPerCtn: 48, tp: 36.89, gtOffer: 2.5, mtOffer: 2.5, wsOffer: 0.0, category: 'Peanuts' },
  { code: 'SKU00067', name: 'MASALA PEANUT 40g', gm: 40, pcsPerCtn: 36, tp: 59.02, gtOffer: 2.5, mtOffer: 2.5, wsOffer: 0.0, category: 'Peanuts' },
]

const CATEGORIES = ['All', 'Nimko', 'Peanuts', 'Munchy', 'Daal', 'Potato Sticks', 'Premium']

// ─── Slab Config (same as order form — return credits use same slab terms) ────
const SLABS: Record<string, Record<string, { min: number; max: number; pct: number; label: string }[]>> = {
  'Tier 1': {
    'Retail (GT)': [{ min: 0, max: 999, pct: 0, label: 'No Slab' }, { min: 1000, max: 1999, pct: 2.0, label: 'Slab 1' }, { min: 2000, max: Infinity, pct: 3.0, label: 'Slab 2' }],
    'LMT':         [{ min: 0, max: 1999, pct: 0, label: 'No Slab' }, { min: 2000, max: Infinity, pct: 3.0, label: 'Slab 1' }],
    'Wholesale':   [{ min: 0, max: 1999, pct: 0, label: 'No Slab' }, { min: 2000, max: 3499, pct: 3.0, label: 'Slab 1' }, { min: 3500, max: Infinity, pct: 4.0, label: 'Slab 2' }],
    'Institution': [{ min: 0, max: 1999, pct: 0, label: 'No Slab' }, { min: 2000, max: Infinity, pct: 5.0, label: 'Slab 1' }],
  },
  'Tier 2': {
    'Retail (GT)': [{ min: 0, max: 999, pct: 0, label: 'No Slab' }, { min: 1000, max: 1999, pct: 1.5, label: 'Slab 1' }, { min: 2000, max: Infinity, pct: 2.5, label: 'Slab 2' }],
    'LMT':         [{ min: 0, max: 1999, pct: 0, label: 'No Slab' }, { min: 2000, max: Infinity, pct: 2.0, label: 'Slab 1' }],
    'Wholesale':   [{ min: 0, max: 1999, pct: 0, label: 'No Slab' }, { min: 2000, max: 3499, pct: 2.5, label: 'Slab 1' }, { min: 3500, max: Infinity, pct: 3.5, label: 'Slab 2' }],
    'Institution': [{ min: 0, max: 1999, pct: 0, label: 'No Slab' }, { min: 2000, max: Infinity, pct: 4.0, label: 'Slab 1' }],
  },
}

// ─── Calculation Engine (exact same logic as order/page.tsx) ─────────────────
interface CartItem { id: string; product: Product; qty: number; uom: 'CTN' | 'PCS' }

function calcItem(item: CartItem, channel: string, slabPct: number, taxReg: 'unregistered' | 'registered') {
  const { product, qty, uom } = item
  let offerPct = 0
  if (channel === 'Retail (GT)') offerPct = product.gtOffer
  else if (channel === 'LMT') offerPct = product.mtOffer
  else if (channel === 'Wholesale') offerPct = product.wsOffer
  const units = uom === 'CTN' ? qty * product.pcsPerCtn : qty
  const ctns = uom === 'CTN' ? qty : qty / product.pcsPerCtn
  const gross = units * product.tp
  const tradeDisc = gross * (offerPct / 100)
  const afterTrade = gross - tradeDisc
  const slabDisc = afterTrade * (slabPct / 100)
  const netBeforeGST = afterTrade - slabDisc
  const gstRate = taxReg === 'unregistered' ? 0.22 : 0.18
  const gst = netBeforeGST * gstRate
  const invoiceInclGST = netBeforeGST + gst
  const advTaxRate = taxReg === 'unregistered' ? 0.025 : 0.01
  const advTax = invoiceInclGST * advTaxRate
  const total = invoiceInclGST + advTax
  return { units, ctns: parseFloat(ctns.toFixed(2)), gross, tradeDisc, slabDisc, netBeforeGST, gst, invoiceInclGST, advTax, total, offerPct }
}

function calcReturn(cart: CartItem[], channel: string, tier: string, taxReg: 'unregistered' | 'registered') {
  const grossSubtotal = cart.reduce((s, item) => {
    const units = item.uom === 'CTN' ? item.qty * item.product.pcsPerCtn : item.qty
    return s + units * item.product.tp
  }, 0)
  const slabs = SLABS[tier]?.[channel] || SLABS['Tier 1']['Retail (GT)']
  const activeSlab = [...slabs].reverse().find(s => grossSubtotal >= s.min) || slabs[0]
  const lineItems = cart.map(item => ({ item, calc: calcItem(item, channel, activeSlab.pct, taxReg) }))
  const totalGross        = lineItems.reduce((s, l) => s + l.calc.gross, 0)
  const totalTradeDisc    = lineItems.reduce((s, l) => s + l.calc.tradeDisc, 0)
  const totalSlabDisc     = lineItems.reduce((s, l) => s + l.calc.slabDisc, 0)
  const totalNetBeforeGST = lineItems.reduce((s, l) => s + l.calc.netBeforeGST, 0)
  const totalGST          = lineItems.reduce((s, l) => s + l.calc.gst, 0)
  const totalInclGST      = lineItems.reduce((s, l) => s + l.calc.invoiceInclGST, 0)
  const totalAdvTax       = lineItems.reduce((s, l) => s + l.calc.advTax, 0)
  const totalPayable      = lineItems.reduce((s, l) => s + l.calc.total, 0)
  const totalUnits        = lineItems.reduce((s, l) => s + l.calc.units, 0)
  return { lineItems, activeSlab, grossSubtotal: totalGross, totalTradeDisc, totalSlabDisc, totalNetBeforeGST, totalGST, totalInclGST, totalAdvTax, totalPayable, totalUnits }
}

// ─── Return Condition ─────────────────────────────────────────────────────────
const CONDITIONS = ['Expired', 'Damaged', 'Near Expiry'] as const
type ReturnCondition = typeof CONDITIONS[number]

interface ReturnLine { id: string; condition: ReturnCondition | ''; batch: string; invoiceRef: string }

const COND_IDLE: Record<string, string> = {
  'Expired':    'bg-red-50 border-red-300 text-red-700',
  'Damaged':    'bg-amber-50 border-amber-300 text-amber-700',
  'Near Expiry':'bg-violet-50 border-violet-300 text-violet-700',
}
const COND_ACTIVE: Record<string, string> = {
  'Expired':    'bg-red-600 border-red-600 text-white',
  'Damaged':    'bg-amber-500 border-amber-500 text-white',
  'Near Expiry':'bg-violet-600 border-violet-600 text-white',
}

// ─── Component ────────────────────────────────────────────────────────────────
function ReturnFormInner() {
  const router = useRouter()
  const params = useSearchParams()
  const outletId   = params.get('id')
  const outletName = decodeURIComponent(params.get('outletName') || 'Unknown Outlet')
  const outletCode = params.get('outletCode') || ''
  const pjpName    = decodeURIComponent(params.get('pjp') || '')

  const today  = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const draftId = 'RTN-DRAFT-' + Math.floor(1000 + Math.random() * 9000)

  type View = 'return' | 'picker' | 'review' | 'success' | 'print'
  const [view, setView]         = useState<View>('return')
  const [cart, setCart]         = useState<CartItem[]>([])
  // per-line return metadata (condition, batch, invoiceRef) keyed by cart item id
  const [returnMeta, setReturnMeta] = useState<Record<string, ReturnLine>>({})
  const [channel, setChannel]   = useState<'Retail (GT)'|'LMT'|'Wholesale'|'Institution'>('Retail (GT)')
  const [tier, setTier]         = useState<'Tier 1'|'Tier 2'>('Tier 1')
  const [taxReg, setTaxReg]     = useState<'unregistered'|'registered'>('unregistered')
  const [remarks, setRemarks]   = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [search, setSearch]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [returnId, setReturnId] = useState('')

  const result = useMemo(() => calcReturn(cart, channel, tier, taxReg), [cart, channel, tier, taxReg])

  const filteredProducts = useMemo(() => PRODUCTS.filter(p => {
    const matchCat  = catFilter === 'All' || p.category === catFilter
    const term      = search.toLowerCase()
    const matchSrch = !term || p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term)
    return matchCat && matchSrch
  }), [catFilter, search])

  function addToCart(p: Product) {
    setCart(prev => {
      if (prev.find(c => c.product.code === p.code)) return prev
      const id = p.code + Date.now()
      setReturnMeta(m => ({ ...m, [id]: { id, condition: '', batch: '', invoiceRef: '' } }))
      return [...prev, { id, product: p, qty: 1, uom: 'CTN' }]
    })
    setView('return')
  }

  function removeFromCart(id: string) {
    setCart(prev => prev.filter(c => c.id !== id))
    setReturnMeta(m => { const n = { ...m }; delete n[id]; return n })
  }

  function adjustQty(id: string, delta: number) {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c))
  }

  function setQty(id: string, val: string) {
    const n = parseInt(val)
    if (!isNaN(n) && n > 0) setCart(prev => prev.map(c => c.id === id ? { ...c, qty: n } : c))
  }

  function setUom(id: string, uom: 'CTN'|'PCS') {
    setCart(prev => prev.map(c => c.id === id ? { ...c, uom } : c))
  }

  function setCondition(id: string, condition: ReturnCondition) {
    setReturnMeta(m => ({ ...m, [id]: { ...m[id], condition } }))
  }

  function setMeta(id: string, field: 'batch'|'invoiceRef', val: string) {
    setReturnMeta(m => ({ ...m, [id]: { ...m[id], [field]: val } }))
  }

  const Rs = (n: number) => 'Rs ' + n.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  const gstLabel = taxReg === 'unregistered' ? 'GST 22% · Adv Tax 2.5%' : 'GST 18% · Adv Tax 1%'

  const missingCondition = cart.some(c => !returnMeta[c.id]?.condition)

  async function handleSubmitClaim() {
    if (cart.length === 0)    { alert('Add at least one product.'); return }
    if (missingCondition)     { alert('Select a Return Condition for every item.'); return }
    setSubmitting(true)
    const id = 'RTN-' + String(Math.floor(100000 + Math.random() * 900000))
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.id) {
        await supabase.from('sales_returns').insert({
          invoice_no:     id,
          invoice_date:   new Date().toISOString().slice(0, 10),
          outlet_id:      outletId,
          order_booker_id: session.user.id,
          customer_name:  outletName,
          channel,
          area:           pjpName,
          tier,
          strn_registered: taxReg === 'registered',
          remarks,
          lines: result.lineItems.map(({ item, calc }) => ({
            sku_code:     item.product.code,
            sku_name:     item.product.name,
            qty:          item.qty,
            uom:          item.uom,
            units:        calc.units,
            tp:           item.product.tp,
            trade_disc_pct: calc.offerPct,
            slab_disc_pct:  result.activeSlab.pct,
            gross:        calc.gross,
            trade_disc:   calc.tradeDisc,
            slab_disc:    calc.slabDisc,
            net_before_gst: calc.netBeforeGST,
            gst:          calc.gst,
            adv_tax:      calc.advTax,
            total:        calc.total,
            return_condition: returnMeta[item.id]?.condition,
            batch:        returnMeta[item.id]?.batch || null,
            invoice_ref:  returnMeta[item.id]?.invoiceRef || null,
          })),
          subtotal:       result.grossSubtotal,
          trade_discount: result.totalTradeDisc,
          slab_discount:  result.totalSlabDisc,
          net_amount:     result.totalNetBeforeGST,
          gst_amount:     result.totalGST,
          advance_tax:    result.totalAdvTax,
          total_payable:  result.totalPayable,
          status:         'submitted',
        })
        await supabase.from('outlet_visits').upsert({
          outlet_id:       outletId,
          order_booker_id: session.user.id,
          visit_date:      new Date().toISOString().slice(0, 10),
          status:          'returned',
          visited_at:      new Date().toISOString(),
        }, { onConflict: 'outlet_id,visit_date' })
      }
      setReturnId(id)
      setView('success')
    } catch (err) {
      console.error(err)
      alert('Failed to submit. Please retry.')
      setSubmitting(false)
    }
  }

  // ─── VIEW: PRINT ──────────────────────────────────────────────────────────
  if (view === 'print') return (
    <PrintReturnNote
      returnId={returnId || draftId}
      outletName={outletName}
      outletCode={outletCode}
      pjpName={pjpName}
      channel={channel}
      tier={tier}
      taxReg={taxReg}
      result={result}
      lines={cart.map(c => ({
        id: c.id,
        product: c.product,
        qty: c.qty,
        uom: c.uom,
        condition: (returnMeta[c.id]?.condition || '') as ReturnCondition,
        batch: returnMeta[c.id]?.batch || '',
        invoiceRef: returnMeta[c.id]?.invoiceRef || '',
      }))}
      onBack={() => setView(returnId ? 'success' : 'return')}
    />
  )

  // ─── VIEW: SUCCESS ────────────────────────────────────────────────────────
  if (view === 'success') return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#f1f5f9] items-center justify-center p-8 text-center">
      <div className="w-24 h-24 rounded-full bg-orange-500/20 border-2 border-orange-500/40 flex items-center justify-center mb-6 shadow-inner">
        <span className="material-symbols-outlined text-5xl text-orange-600" style={{ fontVariationSettings: "'FILL' 1" }}>assignment_return</span>
      </div>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 font-bold text-xs rounded-full border border-orange-200 mb-4">
        <span className="material-symbols-outlined text-[14px]">verified</span>Return Claim Submitted
      </div>
      <h1 className="text-2xl font-extrabold text-slate-900 mb-1">{returnId}</h1>
      <p className="text-sm text-slate-500 mb-1">{outletName}</p>
      <p className="text-2xl font-extrabold font-mono text-slate-900">{Rs(result.totalPayable)}</p>
      <p className="text-xs text-slate-400 mt-1 mb-8">{result.totalUnits} Units · {cart.length} SKUs · {today}</p>
      <div className="flex flex-col gap-3 w-full">
        <div className="flex gap-3 w-full">
          <button onClick={() => router.push('/')} className="flex-1 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">home</span> Back
          </button>
          <button onClick={() => { setCart([]); setReturnMeta({}); setReturnId(''); setView('return') }} className="flex-1 py-3.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">add</span> New
          </button>
        </div>
        <button onClick={() => setView('print')} className="w-full py-3.5 bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition border border-sky-200">
          <span className="material-symbols-outlined text-[18px]">print</span> Print / Save Claim Note
        </button>
      </div>
    </div>
  )

  // ─── VIEW: REVIEW (same breakdown structure as order form review) ──────────
  if (view === 'review') return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#f8fafc]">
      <div className="bg-[#071326] text-white px-4 py-3 flex items-center gap-2 shadow-md z-10">
        <button onClick={() => setView('return')} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div className="flex-1">
          <h2 className="text-sm font-bold">Review Return Claim</h2>
          <p className="text-[10px] text-slate-300">Credit note calculation · {channel} · {tier}</p>
        </div>
        <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 text-[10px] font-mono border border-orange-500/30">Credit Calc</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-28">
        {/* Outlet & Settings */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-900 text-[13px]">{outletName}</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold">{channel} · {tier}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div><span className="text-slate-400">SKUs:</span> <strong className="text-slate-800">{result.lineItems.length} ({result.totalUnits} Units)</strong></div>
            <div><span className="text-slate-400">GST Rate:</span> <strong className="text-slate-800">{taxReg === 'unregistered' ? '22%' : '18%'}</strong></div>
            <div><span className="text-slate-400">Adv Tax:</span> <strong className="text-slate-800">{taxReg === 'unregistered' ? '2.5%' : '1%'}</strong></div>
            <div><span className="text-slate-400">Type:</span> <strong className="text-slate-800 capitalize">{taxReg}</strong></div>
          </div>
        </div>

        {/* SKU breakdown */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-2">
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Return SKUs</div>
          <div className="space-y-2 text-xs">
            {result.lineItems.map(({ item, calc }) => {
              const meta = returnMeta[item.id]
              return (
                <div key={item.id} className="flex items-start justify-between border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
                  <div>
                    <div className="font-bold text-slate-900 text-[12px]">{item.product.name}</div>
                    <div className="text-[10px] text-slate-400">{calc.units} units ({calc.ctns} ctns) @ Rs {item.product.tp}</div>
                    <div className="text-[10px] text-teal-600 font-medium leading-tight mt-0.5">
                      Trade {calc.offerPct}% + Slab {result.activeSlab.pct}%
                    </div>
                    {meta?.condition && (
                      <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${COND_IDLE[meta.condition]}`}>{meta.condition}</span>
                    )}
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <div className="font-mono font-bold text-slate-900 text-[12px]">{Rs(calc.total)}</div>
                    <span className="text-[9.5px] text-emerald-600 font-semibold">-{Rs(calc.tradeDisc + calc.slabDisc)} disc</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Financial Calculation Sequence — same as order review */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-2 text-xs">
          <div className="flex items-center gap-1 border-b border-slate-100 pb-2">
            <span className="material-symbols-outlined text-[16px] text-orange-600">receipt_long</span>
            <span className="font-bold text-slate-800 text-[12px]">Credit Note Calculation</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>1. Gross Subtotal (Ex-GST)</span>
            <span className="font-mono font-semibold text-slate-900">{Rs(result.grossSubtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-emerald-700 bg-emerald-50/60 px-2 py-1 rounded">
            <span>2. Trade Offers ({channel})</span>
            <span className="font-mono font-bold">-{Rs(result.totalTradeDisc)}</span>
          </div>
          <div className="flex items-center justify-between text-emerald-700 bg-emerald-50/60 px-2 py-1 rounded">
            <span>3. Slab Discount ({result.activeSlab.pct}%)</span>
            <span className="font-mono font-bold">-{Rs(result.totalSlabDisc)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-800 font-bold border-t border-slate-100 pt-1.5">
            <span>4. Net Amount Before GST</span>
            <span className="font-mono">{Rs(result.totalNetBeforeGST)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>5. GST ({taxReg === 'unregistered' ? '22' : '18'}%)</span>
            <span className="font-mono font-semibold text-slate-800">+{Rs(result.totalGST)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-700 font-semibold border-t border-dashed border-slate-200 pt-1">
            <span>6. Amount Incl. GST</span>
            <span className="font-mono text-slate-800">{Rs(result.totalInclGST)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>7. Advance Tax ({taxReg === 'unregistered' ? '2.5' : '1'}%)</span>
            <span className="font-mono font-semibold text-slate-800">+{Rs(result.totalAdvTax)}</span>
          </div>
          <div className="flex items-center justify-between text-white bg-slate-900 rounded-lg px-3 py-2 mt-1">
            <span className="font-bold text-sm">Total Credit Claim</span>
            <span className="font-mono font-extrabold text-base">{Rs(result.totalPayable)}</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 shadow-2xl p-3 flex flex-col gap-2 z-30">
        <button onClick={handleSubmitClaim} disabled={submitting} className="w-full py-3.5 bg-[#071326] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 shadow-md">
          {submitting
            ? <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
            : <><span className="material-symbols-outlined text-[18px]">send</span> Submit Return Claim</>}
        </button>
        <div className="flex gap-2">
          <button onClick={() => setView('return')} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs border border-slate-300 flex justify-center items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">edit</span> Edit Items
          </button>
          <button onClick={() => setView('print')} className="flex-1 py-2.5 bg-sky-50 text-sky-700 rounded-xl font-bold text-xs border border-sky-200 flex justify-center items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">visibility</span> Print Preview
          </button>
        </div>
      </div>
    </div>
  )

  // ─── VIEW: PRODUCT PICKER (exact same as order/page.tsx picker) ────────────
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

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredProducts.map(p => {
          const inCart = cart.find(c => c.product.code === p.code)
          let offerPct = 0
          if (channel === 'Retail (GT)') offerPct = p.gtOffer
          else if (channel === 'LMT') offerPct = p.mtOffer
          else if (channel === 'Wholesale') offerPct = p.wsOffer
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
                  {offerPct > 0 && <span className="px-1.5 py-0.2 rounded bg-teal-50 text-teal-600 border border-teal-100 text-[9.5px] font-bold">{channel} Offer {offerPct}%</span>}
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
        <button onClick={() => setView('return')} className="w-full h-11 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition">
          <span className="material-symbols-outlined text-[18px]">assignment_return</span>
          View Return List ({cart.length} Items)
        </button>
      </div>
    </div>
  )

  // ─── VIEW: MAIN RETURN SCREEN ─────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#f1f5f9] relative overflow-hidden">

      {/* Header — dark navy identical to order form */}
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
        <button title="More" className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-200">
          <span className="material-symbols-outlined text-[20px]">more_vert</span>
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-28">

        {/* Outlet Card — same as order form */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-orange-50 rounded-full pointer-events-none"></div>
          <div className="flex items-center gap-2 relative">
            <div className="w-9 h-9 rounded-lg bg-[#0f294a] text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>assignment_return</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-slate-900 leading-tight">{outletName}</h2>
                <span className="px-1.5 py-0.2 rounded bg-orange-50 text-orange-700 text-[10px] font-semibold border border-orange-200">Return</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{outletCode}{pjpName ? ` · ${pjpName}` : ''}</p>
            </div>
          </div>
        </div>

        {/* Commercial Settings — same toggle pattern as order form */}
        <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-blue-600">tune</span>
              Commercial Settings
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Tap to change</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => {
              const chs = ['Retail (GT)', 'LMT', 'Wholesale', 'Institution']
              setChannel(c => chs[(chs.indexOf(c) + 1) % chs.length] as typeof channel)
            }} className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-left active:bg-slate-100">
              <div>
                <span className="block text-[9px] uppercase font-bold text-slate-400">Channel</span>
                <span className="text-[11px] font-bold text-slate-800">{channel}</span>
              </div>
              <span className="material-symbols-outlined text-[15px] text-slate-400">swap_horiz</span>
            </button>
            <button onClick={() => setTier(t => t === 'Tier 1' ? 'Tier 2' : 'Tier 1')}
              className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-left active:bg-slate-100">
              <div>
                <span className="block text-[9px] uppercase font-bold text-slate-400">Town Tier</span>
                <span className="text-[11px] font-bold text-slate-800">{tier}</span>
              </div>
              <span className="material-symbols-outlined text-[15px] text-slate-400">swap_horiz</span>
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-600 uppercase">Tax Reg. Status</span>
              <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{gstLabel}</span>
            </div>
            <div className="grid grid-cols-2 p-0.5 bg-slate-100 rounded-lg text-[11px] font-semibold">
              <button onClick={() => setTaxReg('unregistered')}
                className={`py-1 rounded-md transition ${taxReg === 'unregistered' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                Unregistered
              </button>
              <button onClick={() => setTaxReg('registered')}
                className={`py-1 rounded-md transition ${taxReg === 'registered' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                STRN Registered
              </button>
            </div>
          </div>
        </div>

        {/* Add Products button — orange variant of order form's blue button */}
        <button onClick={() => setView('picker')}
          className="w-full h-12 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 border border-orange-500 active:scale-[0.98] transition">
          <span className="material-symbols-outlined text-[22px]">add_circle</span>
          <span>＋ Add Products from Catalog</span>
          <span className="px-2 py-0.5 bg-white/20 text-white rounded text-[11px] font-mono font-semibold ml-1">{PRODUCTS.length} SKUs</span>
        </button>

        {/* Cart Items */}
        {cart.length > 0 && (
          <>
            <div className="flex items-center justify-between px-1 pt-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-700">Return Items</h3>
                <span className="px-1.5 py-0.2 rounded-full bg-orange-100 text-orange-800 font-bold text-[10px]">
                  {cart.length} Products · {result.totalUnits} Units
                </span>
              </div>
              <button onClick={() => setView('picker')} className="text-orange-600 font-bold text-xs flex items-center gap-0.5 hover:underline">
                <span className="material-symbols-outlined text-[15px]">add</span> Add More
              </button>
            </div>

            {result.lineItems.map(({ item, calc }) => {
              const meta = returnMeta[item.id] || { condition: '', batch: '', invoiceRef: '' }
              const conditionSet = !!meta.condition
              return (
                <div key={item.id} className={`bg-white rounded-xl p-3 border shadow-sm relative space-y-2.5 ${conditionSet ? 'border-slate-200' : 'border-red-200 ring-1 ring-red-100'}`}>
                  {/* Product name row */}
                  <div className="flex items-start justify-between">
                    <div className="pr-6">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-[13px] font-bold text-slate-900">{item.product.name}</h4>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-mono font-semibold">{item.product.code}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-50 text-slate-500 text-[9.5px]">{item.product.pcsPerCtn} pcs/ctn</span>
                      </div>
                      <div className="text-[10px] text-teal-700 font-bold bg-teal-50/50 px-1.5 py-1 rounded border border-teal-100/50 leading-tight mt-1.5">
                        Trade {calc.offerPct}% + Slab {result.activeSlab.pct}%
                      </div>
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
                          className={`flex-1 py-1.5 px-1 rounded-lg border text-[10px] font-bold text-center transition active:scale-95 ${meta.condition === cond ? COND_ACTIVE[cond] : COND_IDLE[cond]}`}>
                          {cond}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Qty Stepper — identical to order form */}
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
                        {item.uom === 'CTN' ? `${calc.units} units` : `${calc.ctns} ctns`}
                      </span>
                    </div>
                  </div>

                  {/* Optional: Batch + Invoice Ref */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase">Batch No. <span className="font-normal text-slate-400">(opt.)</span></label>
                      <input type="text" value={meta.batch} onChange={e => setMeta(item.id, 'batch', e.target.value)}
                        placeholder="e.g. B2024-06"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase">Invoice Ref. <span className="font-normal text-slate-400">(opt.)</span></label>
                      <input type="text" value={meta.invoiceRef} onChange={e => setMeta(item.id, 'invoiceRef', e.target.value)}
                        placeholder="e.g. INV-100123"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium" />
                    </div>
                  </div>

                  {/* Financial footer — same as order form line footer */}
                  <div className="flex flex-wrap items-end justify-between gap-x-2 gap-y-1.5 pt-1.5 text-[10px] border-t border-slate-100 text-slate-500 font-medium">
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-[9px] leading-tight">Rate (Ex-GST)</span>
                      <span className="font-mono text-slate-700">{item.product.tp}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-[9px] leading-tight">Trade Disc</span>
                      <span className="font-mono text-emerald-600 font-semibold">-{Rs(calc.tradeDisc)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-[9px] leading-tight">Slab Disc</span>
                      <span className="font-mono text-emerald-600 font-semibold">-{Rs(calc.slabDisc)}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-slate-400 text-[9px] leading-tight">Line Credit</span>
                      <span className="font-mono font-bold text-slate-900">{Rs(calc.total)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* Remarks */}
        <div className="bg-white rounded-xl p-2.5 border border-slate-200 text-[11px] space-y-1">
          <label className="font-semibold text-slate-700 flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-slate-400">edit_note</span>
            Claim Remarks (Optional)
          </label>
          <input type="text" placeholder="e.g. Goods to be collected by distributor on Monday" value={remarks}
            onChange={e => setRemarks(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
      </div>

      {/* Sticky bottom bar — same layout as order form */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-3 py-2.5 shadow-2xl z-30 flex items-center justify-between gap-3">
        <div className="flex-1 cursor-pointer" onClick={() => cart.length > 0 && !missingCondition && setView('review')}>
          {missingCondition && cart.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-red-600 font-bold">
              <span className="material-symbols-outlined text-[13px]">warning</span>
              <span>Select condition on all items</span>
            </div>
          )}
          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Credit:</span>
            <span className="text-base font-extrabold font-mono text-slate-950">{Rs(result.totalPayable)}</span>
          </div>
          <span className="text-[9.5px] text-slate-400">{result.totalUnits} Units · {cart.length} SKUs</span>
        </div>

        <button
          onClick={() => cart.length > 0 && !missingCondition && setView('review')}
          disabled={cart.length === 0 || missingCondition}
          className={`h-11 px-4 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition shrink-0 ${cart.length > 0 && !missingCondition ? 'bg-slate-900 hover:bg-black text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
          <span>Review Claim</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
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
