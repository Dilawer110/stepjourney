'use client'
import { useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// ─── Product Master ─────────────────────────────────────────────────────────
interface Product {
  code: string; name: string; gm: number; pcsPerCtn: number
  tp: number   // Trade Price per unit (ex-GST), retail price
  gtOffer: number  // GT channel offer %
  mtOffer: number  // MT channel offer %
  category: string
}

const PRODUCTS: Product[] = [
  { code: 'SKU00011', name: 'DAAL SEV 16g', gm: 16, pcsPerCtn: 72, tp: 18, gtOffer: 2.5, mtOffer: 3.0, category: 'Nimko' },
  { code: 'SKU00001', name: 'POTATO STICK (CHATPATA) 16g', gm: 16, pcsPerCtn: 72, tp: 18, gtOffer: 2.0, mtOffer: 2.5, category: 'Potato Sticks' },
  { code: 'SKU00030', name: 'SPICY MIX NIMKO 16g', gm: 16, pcsPerCtn: 72, tp: 18, gtOffer: 2.5, mtOffer: 3.0, category: 'Nimko' },
  { code: 'SKU00021', name: 'NIMBOO DAAL 16g', gm: 16, pcsPerCtn: 72, tp: 18, gtOffer: 2.5, mtOffer: 3.0, category: 'Nimko' },
  { code: 'SKU00023', name: 'NIMKO MIX HOT & SPICY 16g', gm: 16, pcsPerCtn: 72, tp: 18, gtOffer: 2.0, mtOffer: 2.5, category: 'Nimko' },
  { code: 'SKU00024', name: 'NIMKO MIX LEMON & CHILLI 16g', gm: 16, pcsPerCtn: 72, tp: 18, gtOffer: 2.0, mtOffer: 2.5, category: 'Nimko' },
  { code: 'SKU00003', name: 'MUNCHY (SALTED) 10g', gm: 10, pcsPerCtn: 48, tp: 18, gtOffer: 2.0, mtOffer: 2.5, category: 'Munchy' },
  { code: 'SKU00005', name: 'MUNCHY (VEGETABLE EU) 10g', gm: 10, pcsPerCtn: 48, tp: 18, gtOffer: 2.0, mtOffer: 2.5, category: 'Munchy' },
  { code: 'SKU00037', name: 'DAAL SEV Box 192g', gm: 192, pcsPerCtn: 12, tp: 216, gtOffer: 3.0, mtOffer: 3.5, category: 'Nimko' },
  { code: 'SKU00038', name: 'POTATO STICK Box 192g', gm: 192, pcsPerCtn: 12, tp: 216, gtOffer: 2.5, mtOffer: 3.0, category: 'Potato Sticks' },
  { code: 'SKU00068', name: 'SPICY MIX NIMKO Box 192g', gm: 192, pcsPerCtn: 12, tp: 216, gtOffer: 3.0, mtOffer: 3.5, category: 'Nimko' },
  { code: 'SKU00039', name: 'NIMBOO DAAL Box 192g', gm: 192, pcsPerCtn: 12, tp: 216, gtOffer: 3.0, mtOffer: 3.5, category: 'Nimko' },
  { code: 'SKU00040', name: 'NIMKO MIX HOT & SPICY Box 192g', gm: 192, pcsPerCtn: 12, tp: 216, gtOffer: 2.5, mtOffer: 3.0, category: 'Nimko' },
  { code: 'SKU00041', name: 'NIMKO MIX LEMON & CHILLI Box 192g', gm: 192, pcsPerCtn: 12, tp: 216, gtOffer: 2.5, mtOffer: 3.0, category: 'Nimko' },
  { code: 'SKU00020', name: 'NIMBOO DAAL 24g', gm: 24, pcsPerCtn: 48, tp: 27, gtOffer: 2.5, mtOffer: 3.0, category: 'Nimko' },
  { code: 'SKU00009', name: 'DAAL MOUNG 18g', gm: 18, pcsPerCtn: 72, tp: 27, gtOffer: 2.5, mtOffer: 3.0, category: 'Daal' },
  { code: 'SKU00042', name: 'DAAL MOUNG Box 216g', gm: 216, pcsPerCtn: 12, tp: 324, gtOffer: 3.0, mtOffer: 3.5, category: 'Daal' },
  { code: 'SKU00050', name: 'NIMKO MIX HOT & SPICY 24g', gm: 24, pcsPerCtn: 48, tp: 27, gtOffer: 2.0, mtOffer: 2.5, category: 'Nimko' },
  { code: 'SKU00002', name: 'POTATO STICK (S&P) 24g', gm: 24, pcsPerCtn: 48, tp: 27, gtOffer: 2.0, mtOffer: 2.5, category: 'Potato Sticks' },
  { code: 'SKU00034', name: 'SALTED PEANUT 16g', gm: 16, pcsPerCtn: 84, tp: 27, gtOffer: 2.5, mtOffer: 3.0, category: 'Peanuts' },
  { code: 'SKU00031', name: 'PEANUT UNSALTED 16g', gm: 16, pcsPerCtn: 84, tp: 27, gtOffer: 2.5, mtOffer: 3.0, category: 'Peanuts' },
  { code: 'SKU00051', name: 'NIMKO MIX LEMON & CHILLI 24g', gm: 24, pcsPerCtn: 48, tp: 27, gtOffer: 2.0, mtOffer: 2.5, category: 'Nimko' },
  { code: 'SKU00007', name: 'SPICY MIX NIMKO 24g', gm: 24, pcsPerCtn: 48, tp: 27, gtOffer: 2.5, mtOffer: 3.0, category: 'Nimko' },
  { code: 'SKU00012', name: 'DAAL SEV 24g', gm: 24, pcsPerCtn: 48, tp: 27, gtOffer: 2.5, mtOffer: 3.0, category: 'Nimko' },
  { code: 'SKU00004', name: 'MUNCHY (SALTED) 15g', gm: 15, pcsPerCtn: 36, tp: 27, gtOffer: 2.0, mtOffer: 2.5, category: 'Munchy' },
  { code: 'SKU00006', name: 'MUNCHY (VEGETABLE EU) 15g', gm: 15, pcsPerCtn: 36, tp: 27, gtOffer: 2.0, mtOffer: 2.5, category: 'Munchy' },
  { code: 'SKU00025', name: 'NIMKO SALT & PEPPER 40g', gm: 40, pcsPerCtn: 36, tp: 45, gtOffer: 2.5, mtOffer: 3.0, category: 'Nimko' },
  { code: 'SKU00008', name: 'CHEWRA NIMKO 30g', gm: 30, pcsPerCtn: 36, tp: 45, gtOffer: 2.5, mtOffer: 3.0, category: 'Nimko' },
  { code: 'SKU00010', name: 'DAAL MOUNG 30g', gm: 30, pcsPerCtn: 48, tp: 45, gtOffer: 2.5, mtOffer: 3.0, category: 'Daal' },
  { code: 'SKU00035', name: 'SALTED PEANUT 25g', gm: 25, pcsPerCtn: 48, tp: 45, gtOffer: 2.5, mtOffer: 3.0, category: 'Peanuts' },
  { code: 'SKU00032', name: 'PEANUT UNSALTED 25g', gm: 25, pcsPerCtn: 48, tp: 45, gtOffer: 2.5, mtOffer: 3.0, category: 'Peanuts' },
  { code: 'SKU00014', name: 'KHAT MITHA 30g', gm: 30, pcsPerCtn: 36, tp: 45, gtOffer: 2.0, mtOffer: 2.5, category: 'Nimko' },
  { code: 'SKU00013', name: 'KARACHI NIMCO MIX 40g', gm: 40, pcsPerCtn: 36, tp: 45, gtOffer: 2.5, mtOffer: 3.0, category: 'Nimko' },
  { code: 'SKU00056', name: 'MUNCHY (SALTED) 25g', gm: 25, pcsPerCtn: 24, tp: 45, gtOffer: 2.0, mtOffer: 2.5, category: 'Munchy' },
  { code: 'SKU00069', name: 'MUNCHY (VEGETABLE EU) 25g', gm: 25, pcsPerCtn: 24, tp: 45, gtOffer: 2.0, mtOffer: 2.5, category: 'Munchy' },
  { code: 'SKU00036', name: 'SALTED PEANUT 40g', gm: 40, pcsPerCtn: 36, tp: 72, gtOffer: 2.5, mtOffer: 3.0, category: 'Peanuts' },
  { code: 'SKU00033', name: 'PEANUT UNSALTED 40g', gm: 40, pcsPerCtn: 36, tp: 72, gtOffer: 2.5, mtOffer: 3.0, category: 'Peanuts' },
  { code: 'SKU00029', name: 'SHAHI MIX 80g', gm: 80, pcsPerCtn: 36, tp: 225, gtOffer: 3.0, mtOffer: 3.5, category: 'Premium' },
  { code: 'SKU00016', name: 'LAHORI MIX 80g', gm: 80, pcsPerCtn: 36, tp: 162, gtOffer: 3.0, mtOffer: 3.5, category: 'Premium' },
  { code: 'SKU00054', name: 'NIMKO SALT & PEPPER 80g', gm: 80, pcsPerCtn: 36, tp: 108, gtOffer: 2.5, mtOffer: 3.0, category: 'Nimko' },
  { code: 'SKU00028', name: 'SHAHI MIX 180g', gm: 180, pcsPerCtn: 30, tp: 450, gtOffer: 3.5, mtOffer: 4.0, category: 'Premium' },
  { code: 'SKU00015', name: 'LAHORI MIX 180g', gm: 180, pcsPerCtn: 30, tp: 360, gtOffer: 3.5, mtOffer: 4.0, category: 'Premium' },
  { code: 'SKU00052', name: 'LEMON & CHILLI 180g', gm: 180, pcsPerCtn: 30, tp: 243, gtOffer: 3.0, mtOffer: 3.5, category: 'Nimko' },
  { code: 'SKU00019', name: 'MASOOR MASALA 180g', gm: 180, pcsPerCtn: 30, tp: 243, gtOffer: 3.0, mtOffer: 3.5, category: 'Nimko' },
  { code: 'SKU00053', name: 'NIMKO SALT & PEPPER 180g', gm: 180, pcsPerCtn: 30, tp: 243, gtOffer: 3.0, mtOffer: 3.5, category: 'Nimko' },
  { code: 'SKU00064', name: 'DAAL SEV Strip 16g', gm: 16, pcsPerCtn: 72, tp: 18, gtOffer: 2.0, mtOffer: 2.5, category: 'Nimko' },
  { code: 'SKU00058', name: 'POTATO STICK Strip 16g', gm: 16, pcsPerCtn: 72, tp: 18, gtOffer: 2.0, mtOffer: 2.5, category: 'Potato Sticks' },
  { code: 'SKU00059', name: 'SPICY MIX NIMKO Strip 16g', gm: 16, pcsPerCtn: 72, tp: 18, gtOffer: 2.5, mtOffer: 3.0, category: 'Nimko' },
  { code: 'SKU00060', name: 'NIMBOO DAAL Strip 16g', gm: 16, pcsPerCtn: 72, tp: 18, gtOffer: 2.5, mtOffer: 3.0, category: 'Nimko' },
  { code: 'SKU00061', name: 'NIMKO MIX HOT & SPICY Strip 16g', gm: 16, pcsPerCtn: 72, tp: 18, gtOffer: 2.0, mtOffer: 2.5, category: 'Nimko' },
  { code: 'SKU00062', name: 'NIMKO MIX LEMON & CHILLI Strip 16g', gm: 16, pcsPerCtn: 72, tp: 18, gtOffer: 2.0, mtOffer: 2.5, category: 'Nimko' },
  { code: 'SKU00063', name: 'DAAL MOUNG Strip 18g', gm: 18, pcsPerCtn: 72, tp: 27, gtOffer: 2.5, mtOffer: 3.0, category: 'Daal' },
  { code: 'SKU00065', name: 'MASALA PEANUT 16g', gm: 16, pcsPerCtn: 84, tp: 27, gtOffer: 2.5, mtOffer: 3.0, category: 'Peanuts' },
  { code: 'SKU00066', name: 'MASALA PEANUT 25g', gm: 25, pcsPerCtn: 48, tp: 45, gtOffer: 2.5, mtOffer: 3.0, category: 'Peanuts' },
  { code: 'SKU00067', name: 'MASALA PEANUT 40g', gm: 40, pcsPerCtn: 36, tp: 72, gtOffer: 2.5, mtOffer: 3.0, category: 'Peanuts' },
]

const CATEGORIES = ['All', 'Nimko', 'Peanuts', 'Munchy', 'Daal', 'Potato Sticks', 'Premium']

// ─── Slab Configuration ──────────────────────────────────────────────────────
const SLABS: Record<string, Record<string, {min: number, max: number, pct: number, label: string}[]>> = {
  'Tier 1': {
    'Retail (GT)': [
      { min: 0, max: 999, pct: 0, label: 'No Slab' },
      { min: 1000, max: 1999, pct: 2.0, label: 'Slab 1' },
      { min: 2000, max: Infinity, pct: 3.0, label: 'Slab 2' }
    ],
    'LMT': [
      { min: 0, max: 1999, pct: 0, label: 'No Slab' },
      { min: 2000, max: Infinity, pct: 3.0, label: 'Slab 1' }
    ],
    'Wholesale': [
      { min: 0, max: 1999, pct: 0, label: 'No Slab' },
      { min: 2000, max: 3499, pct: 3.0, label: 'Slab 1' },
      { min: 3500, max: Infinity, pct: 4.0, label: 'Slab 2' }
    ],
    'Institution': [
      { min: 0, max: 1999, pct: 0, label: 'No Slab' },
      { min: 2000, max: Infinity, pct: 5.0, label: 'Slab 1' }
    ]
  },
  'Tier 2': {
    'Retail (GT)': [
      { min: 0, max: 999, pct: 0, label: 'No Slab' },
      { min: 1000, max: 1999, pct: 1.5, label: 'Slab 1' },
      { min: 2000, max: Infinity, pct: 2.5, label: 'Slab 2' }
    ],
    'LMT': [
      { min: 0, max: 1999, pct: 0, label: 'No Slab' },
      { min: 2000, max: Infinity, pct: 2.0, label: 'Slab 1' }
    ],
    'Wholesale': [
      { min: 0, max: 1999, pct: 0, label: 'No Slab' },
      { min: 2000, max: 3499, pct: 2.5, label: 'Slab 1' },
      { min: 3500, max: Infinity, pct: 3.5, label: 'Slab 2' }
    ],
    'Institution': [
      { min: 0, max: 1999, pct: 0, label: 'No Slab' },
      { min: 2000, max: Infinity, pct: 4.0, label: 'Slab 1' }
    ]
  }
}

function getSlabs(channel: string, tier: string) {
  return SLABS[tier]?.[channel] || SLABS['Tier 1']['Retail (GT)']
}

// ─── Calculation Engine ───────────────────────────────────────────────────────
interface CartItem {
  id: string
  product: Product
  qty: number
  uom: 'CTN' | 'PCS'
}

function calcItem(item: CartItem, channel: string, slabPct: number, taxReg: 'unregistered' | 'registered') {
  const { product, qty, uom } = item
  const channelOfferPct = channel === 'Retail (GT)' ? product.gtOffer : product.mtOffer
  const units = uom === 'CTN' ? qty * product.pcsPerCtn : qty
  const ctns = uom === 'CTN' ? qty : qty / product.pcsPerCtn

  // Gross (Ex-GST at trade price)
  const gross = units * product.tp

  // Trade offer discount
  const tradeDisc = gross * (channelOfferPct / 100)

  // Slab discount applied after trade offer
  const afterTrade = gross - tradeDisc
  const slabDisc = afterTrade * (slabPct / 100)

  // Net before GST
  const netBeforeGST = afterTrade - slabDisc

  // GST
  const gstRate = taxReg === 'unregistered' ? 0.22 : 0.18
  const gst = netBeforeGST * gstRate

  // Invoice amount incl GST
  const invoiceInclGST = netBeforeGST + gst

  // Advance tax
  const advTaxRate = taxReg === 'unregistered' ? 0.025 : 0.01
  const advTax = invoiceInclGST * advTaxRate

  // Total payable (including taxes)
  const total = invoiceInclGST + advTax

  // Landed cost per unit (Net of discounts, before statutory taxes)
  // Retailers evaluate their margins against the discounted Trade Price
  const landedUnit = netBeforeGST / units
  const landedDzn = landedUnit * 12
  const landedCtn = landedUnit * product.pcsPerCtn

  return {
    units, ctns: parseFloat(ctns.toFixed(2)),
    gross, tradeDisc, slabDisc, netBeforeGST, gst, invoiceInclGST, advTax, total,
    channelOfferPct, landedUnit, landedDzn, landedCtn,
  }
}

function calcOrder(cart: CartItem[], channel: string, tier: string, taxReg: 'unregistered' | 'registered') {
  // First pass: gross subtotal for slab determination
  const grossSubtotal = cart.reduce((sum, item) => {
    const units = item.uom === 'CTN' ? item.qty * item.product.pcsPerCtn : item.qty
    return sum + units * item.product.tp
  }, 0)

  const slabs = getSlabs(channel, tier)
  const activeSlab = [...slabs].reverse().find(s => grossSubtotal >= s.min) || slabs[0]
  const nextSlab = slabs.find(s => s.min > grossSubtotal)

  const lineItems = cart.map(item => ({
    item,
    calc: calcItem(item, channel, activeSlab.pct, taxReg),
  }))

  const totalGross = lineItems.reduce((s, l) => s + l.calc.gross, 0)
  const totalTradeDisc = lineItems.reduce((s, l) => s + l.calc.tradeDisc, 0)
  const totalSlabDisc = lineItems.reduce((s, l) => s + l.calc.slabDisc, 0)
  const totalNetBeforeGST = lineItems.reduce((s, l) => s + l.calc.netBeforeGST, 0)
  const totalGST = lineItems.reduce((s, l) => s + l.calc.gst, 0)
  const totalInclGST = lineItems.reduce((s, l) => s + l.calc.invoiceInclGST, 0)
  const totalAdvTax = lineItems.reduce((s, l) => s + l.calc.advTax, 0)
  const totalPayable = lineItems.reduce((s, l) => s + l.calc.total, 0)
  const totalUnits = lineItems.reduce((s, l) => s + l.calc.units, 0)
  const totalSavings = totalTradeDisc + totalSlabDisc

  return {
    lineItems, activeSlab, nextSlab, grossSubtotal: totalGross,
    totalTradeDisc, totalSlabDisc, totalNetBeforeGST, totalGST,
    totalInclGST, totalAdvTax, totalPayable, totalUnits, totalSavings,
  }
}

// ─── Main Page Component ──────────────────────────────────────────────────────
function InvoiceInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const outletId = searchParams.get('outletId')
  const outletName = decodeURIComponent(searchParams.get('outletName') || 'Al Madina General Store')
  const outletCode = searchParams.get('outletCode') || 'N00000000'
  const pjpName = searchParams.get('pjp') || 'Route A'

  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const draftId = 'INV-DRAFT-' + Math.floor(1000 + Math.random() * 9000)

  // State
  type View = 'order' | 'picker' | 'review' | 'success'
  const [view, setView] = useState<View>('order')
  const [cart, setCart] = useState<CartItem[]>([])
  const [channel, setChannel] = useState<'Retail (GT)' | 'LMT' | 'Wholesale' | 'Institution'>('Retail (GT)')
  const [tier, setTier] = useState<'Tier 1' | 'Tier 2'>('Tier 1')
  const [taxReg, setTaxReg] = useState<'unregistered' | 'registered'>('unregistered')
  const [remarks, setRemarks] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [invoiceId, setInvoiceId] = useState('')

  const order = useMemo(() => calcOrder(cart, channel, tier, taxReg), [cart, channel, tier, taxReg])

  const filteredProducts = useMemo(() => PRODUCTS.filter(p => {
    const matchCat = catFilter === 'All' || p.category === catFilter
    const term = search.toLowerCase()
    const matchSearch = !term || p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term)
    return matchCat && matchSearch
  }), [catFilter, search])

  function addToCart(p: Product) {
    setCart(prev => {
      const exists = prev.find(c => c.product.code === p.code)
      if (exists) return prev.map(c => c.product.code === p.code ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { id: p.code + Date.now(), product: p, qty: 1, uom: 'CTN' }]
    })
  }

  function removeFromCart(id: string) {
    setCart(prev => prev.filter(c => c.id !== id))
  }

  function adjustQty(id: string, delta: number) {
    setCart(prev => prev.map(c => {
      if (c.id !== id) return c
      const newQty = Math.max(1, c.qty + delta)
      return { ...c, qty: newQty }
    }))
  }

  function setQty(id: string, val: string) {
    const n = parseInt(val)
    if (!isNaN(n) && n > 0) setCart(prev => prev.map(c => c.id === id ? { ...c, qty: n } : c))
  }

  function setUom(id: string, uom: 'CTN' | 'PCS') {
    setCart(prev => prev.map(c => c.id === id ? { ...c, uom } : c))
  }

  const Rs = (n: number) => 'Rs ' + n.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  async function handleCreateInvoice() {
    setSubmitting(true)
    const id = 'INV-' + String(Math.floor(100000 + Math.random() * 900000))
    try {
      const { data: { session } } = await supabase.auth.getSession()
      // Store in DB if session exists
      if (session?.user) {
        await supabase.from('outlet_visits').upsert({
          outlet_id: outletId, order_booker_id: session.user.id,
          visit_date: new Date().toISOString().slice(0, 10), status: 'billed',
          visited_at: new Date().toISOString(),
        }, { onConflict: 'outlet_id,visit_date' })
      }
      setInvoiceId(id)
      setView('success')
    } catch {
      alert('Failed to create invoice. Please retry.')
      setSubmitting(false)
    }
  }

  const gstLabel = taxReg === 'unregistered' ? 'GST 22% · Adv Tax 2.5%' : 'GST 18% · Adv Tax 1%'

  // ─── VIEWS ────────────────────────────────────────────────────────────────

  if (view === 'success') return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#f1f5f9] items-center justify-center p-8 text-center">
      <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mb-6 shadow-inner">
        <span className="material-symbols-outlined text-5xl text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      </div>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200 mb-4">
        <span className="material-symbols-outlined text-[14px]">verified</span>
        Invoice Created Successfully
      </div>
      <h1 className="text-2xl font-extrabold text-slate-900 mb-1">{invoiceId}</h1>
      <p className="text-sm text-slate-500 mb-2">{outletName}</p>
      <p className="text-2xl font-extrabold font-mono text-slate-900">{Rs(order.totalPayable)}</p>
      <p className="text-xs text-slate-400 mt-1 mb-8">{order.totalUnits} Units · {order.lineItems.length} SKUs · {today}</p>
      <div className="flex gap-3 w-full">
        <button onClick={() => router.push('/')} className="flex-1 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-[18px]">home</span> Back to Routing
        </button>
        <button onClick={() => { setCart([]); setView('order') }} className="flex-1 py-3.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-[18px]">add</span> New Invoice
        </button>
      </div>
    </div>
  )

  if (view === 'review') return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#f8fafc]">
      <div className="bg-[#071326] text-white px-4 py-3 flex items-center gap-2 shadow-md z-10">
        <button onClick={() => setView('order')} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div className="flex-1">
          <h2 className="text-sm font-bold">Review Invoice Summary</h2>
          <p className="text-[10px] text-slate-300">Exact calculation & statutory tax breakdown</p>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">Final Audit</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-28">
        {/* Outlet & Settings */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-900 text-[13px]">{outletName}</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold">{channel} · {tier}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div><span className="text-slate-400">Tax Type:</span> <strong className="text-slate-800 capitalize">{taxReg}</strong></div>
            <div><span className="text-slate-400">SKUs:</span> <strong className="text-slate-800">{order.lineItems.length} ({order.totalUnits} Units)</strong></div>
            <div><span className="text-slate-400">GST Rate:</span> <strong className="text-slate-800">{taxReg === 'unregistered' ? '22%' : '18%'}</strong></div>
            <div><span className="text-slate-400">Adv Tax:</span> <strong className="text-slate-800">{taxReg === 'unregistered' ? '2.5%' : '1%'}</strong></div>
          </div>
        </div>

        {/* SKU Breakdown */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-2">
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Ordered SKUs</div>
          <div className="space-y-2 text-xs">
            {order.lineItems.map(({ item, calc }) => (
              <div key={item.id} className="flex items-start justify-between border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
                <div>
                  <div className="font-bold text-slate-900 text-[12px]">{item.product.name}</div>
                  <div className="text-[10px] text-slate-400">{calc.units} units ({calc.ctns} ctns) @ Rs {item.product.tp}</div>
                  <div className="text-[10px] text-teal-600 font-medium leading-tight mt-0.5">
                    Trade {calc.channelOfferPct}% + Slab {order.activeSlab.pct}% → Landed Rs {calc.landedUnit.toFixed(2)}/unit, Rs {calc.landedDzn.toFixed(2)}/Dzn, Rs {calc.landedCtn.toFixed(2)}/Ctn
                  </div>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <div className="font-mono font-bold text-slate-900 text-[12px]">{Rs(calc.total)}</div>
                  <span className="text-[9.5px] text-emerald-600 font-semibold">-{Rs(calc.tradeDisc + calc.slabDisc)} saved</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statutory Calculation Sequence */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-2 text-xs">
          <div className="flex items-center gap-1 border-b border-slate-100 pb-2">
            <span className="material-symbols-outlined text-[16px] text-blue-600">receipt_long</span>
            <span className="font-bold text-slate-800 text-[12px]">Financial Calculation Sequence</span>
          </div>

          {[
            { label: '1. Gross Subtotal (Ex-GST)', val: order.grossSubtotal, color: 'text-slate-700' },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between text-slate-600">
              <span>{r.label}</span>
              <span className="font-mono font-semibold text-slate-900">{Rs(r.val)}</span>
            </div>
          ))}

          <div className="flex items-center justify-between text-emerald-700 bg-emerald-50/60 px-2 py-1 rounded">
            <span>2. Trade Offers ({channel} channel)</span>
            <span className="font-mono font-bold">-{Rs(order.totalTradeDisc)}</span>
          </div>
          <div className="flex items-center justify-between text-emerald-700 bg-emerald-50/60 px-2 py-1 rounded">
            <span>3. Slab Discount ({order.activeSlab.pct}%)</span>
            <span className="font-mono font-bold">-{Rs(order.totalSlabDisc)}</span>
          </div>
          <div className="flex items-center justify-between text-emerald-700 font-semibold px-2">
            <span>Total Discounts & Offers</span>
            <span className="font-mono font-bold">-{Rs(order.totalSavings)}</span>
          </div>

          <div className="flex items-center justify-between text-slate-800 font-bold border-t border-slate-100 pt-1.5">
            <span>4. Net Amount Before GST</span>
            <span className="font-mono">{Rs(order.totalNetBeforeGST)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>5. GST ({taxReg === 'unregistered' ? '22' : '18'}%)</span>
            <span className="font-mono font-semibold text-slate-800">+{Rs(order.totalGST)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-700 font-semibold border-t border-dashed border-slate-200 pt-1">
            <span>6. Invoice Amount (Incl. GST)</span>
            <span className="font-mono text-slate-800">{Rs(order.totalInclGST)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>7. Advance Income Tax ({taxReg === 'unregistered' ? '2.5' : '1'}%)</span>
            <span className="font-mono font-semibold text-slate-800">+{Rs(order.totalAdvTax)}</span>
          </div>

          <div className="flex items-center justify-between text-white bg-slate-900 rounded-lg px-3 py-2 mt-1">
            <span className="font-bold text-sm">Total Payable</span>
            <span className="font-mono font-extrabold text-base">{Rs(order.totalPayable)}</span>
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 shadow-2xl p-3 flex gap-3 z-30">
        <button onClick={() => setView('order')} className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm border border-slate-300">
          Edit Order
        </button>
        <button onClick={handleCreateInvoice} disabled={submitting} className="flex-1 py-3.5 bg-[#071326] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 shadow-md">
          {submitting
            ? <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
            : <><span className="material-symbols-outlined text-[18px]">send</span> Create Invoice</>}
        </button>
      </div>
    </div>
  )

  if (view === 'picker') return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white">
      <div className="bg-[#071326] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <button onClick={() => setView('order')} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <div>
            <h2 className="text-sm font-bold">Product Catalog</h2>
            <p className="text-[10px] text-slate-300">Tap card to add to order</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-blue-900 text-blue-200 text-[10px] font-mono">{channel} Price List</span>
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
          const offerPct = channel === 'Retail (GT)' ? p.gtOffer : p.mtOffer
          return (
            <div key={p.code} onClick={() => addToCart(p)}
              className="bg-white hover:bg-blue-50/40 p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.99] transition">
              <div className="space-y-0.5 flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-900 truncate">{p.name}</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[9px] shrink-0">{p.code}</span>
                </div>
                <div className="text-[10px] text-slate-500">{p.pcsPerCtn} pcs/ctn · {p.category}</div>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[11px] font-bold text-slate-900 font-mono">Rs {p.tp} <span className="text-[9px] font-normal text-slate-500">/unit</span></span>
                  <span className="px-1.5 py-0.2 rounded bg-teal-50 text-teal-600 border border-teal-100 text-[9.5px] font-bold">{channel} Offer {offerPct}%</span>
                </div>
              </div>
              <button className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 border transition ${inCart ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                <span className="material-symbols-outlined text-[18px]">{inCart ? 'check' : 'add'}</span>
              </button>
            </div>
          )
        })}
      </div>

      <div className="p-3 bg-white border-t border-slate-200">
        <button onClick={() => setView('order')}
          className="w-full h-11 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition">
          <span className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>
          View Cart ({cart.length} Items)
        </button>
      </div>
    </div>
  )

  // ─── VIEW: MAIN ORDER SCREEN ─────────────────────────────────────────────
  const { activeSlab, nextSlab, grossSubtotal, totalPayable, totalUnits, totalSavings } = order
  const slabProgress = nextSlab ? Math.min(100, (grossSubtotal / nextSlab.min) * 100) : 100
  const toNextSlab = nextSlab ? Math.max(0, nextSlab.min - grossSubtotal) : 0

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#f1f5f9] relative overflow-hidden">
      {/* Header */}
      <div className="bg-[#071326] text-white px-4 py-2.5 shadow-md flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight">New Invoice</h1>
              <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-medium rounded border border-emerald-500/30">Auto-Draft</span>
            </div>
            <p className="text-[10px] text-slate-300 font-mono">{draftId} · {today}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button title="More" className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-200">
            <span className="material-symbols-outlined text-[20px]">more_vert</span>
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-28">

        {/* Outlet Card */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-blue-50 rounded-full pointer-events-none"></div>
          <div className="flex items-start justify-between relative">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#0f294a] text-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-slate-900 leading-tight">{outletName}</h2>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">PJP Valid</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">{outletCode} · {pjpName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Commercial Settings */}
        <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-blue-600">tune</span>
              Commercial Settings
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Tap to change</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Channel */}
            <button onClick={() => {
              const channels = ['Retail (GT)', 'LMT', 'Wholesale', 'Institution'];
              setChannel(c => channels[(channels.indexOf(c) + 1) % channels.length] as any);
            }}
              className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-left active:bg-slate-100">
              <div>
                <span className="block text-[9px] uppercase font-bold text-slate-400">Channel</span>
                <span className="text-[11px] font-bold text-slate-800">{channel}</span>
              </div>
              <span className="material-symbols-outlined text-[15px] text-slate-400">swap_horiz</span>
            </button>
            {/* Tier */}
            <button onClick={() => setTier(t => t === 'Tier 1' ? 'Tier 2' : 'Tier 1')}
              className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-left active:bg-slate-100">
              <div>
                <span className="block text-[9px] uppercase font-bold text-slate-400">Town Tier</span>
                <span className="text-[11px] font-bold text-slate-800">{tier}</span>
              </div>
              <span className="material-symbols-outlined text-[15px] text-slate-400">swap_horiz</span>
            </button>
          </div>

          {/* Tax status toggle */}
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

        {/* Slab Progress Card */}
        <div className="bg-gradient-to-r from-[#071326] to-slate-900 text-white rounded-xl p-3 shadow-md border border-blue-900/80 relative overflow-hidden">
          <div className="flex items-start justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                <span className="material-symbols-outlined text-[15px]">percent</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wide block">Current Qualifying Tier</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold text-white">
                    {activeSlab.pct > 0 ? `${activeSlab.pct}% Slab Active` : 'No Slab Yet'}
                  </span>
                  {activeSlab.pct > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-[9px]">ACHIEVED ✓</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-300 block">Gross Subtotal</span>
              <span className="font-mono font-bold text-xs text-blue-200">{Rs(grossSubtotal)}</span>
            </div>
          </div>

          <div className="mt-2">
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
              <div className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${slabProgress}%` }}></div>
            </div>
            <div className="flex items-center justify-between mt-1.5 text-[10px]">
              {nextSlab ? (
                <span className="text-amber-300 font-semibold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[13px]">trending_up</span>
                  Add {Rs(toNextSlab)} more to unlock {nextSlab.pct}%
                </span>
              ) : (
                <span className="text-emerald-300 font-semibold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  Max Slab Unlocked!
                </span>
              )}
              {totalSavings > 0 && <span className="text-slate-400 font-mono">Savings: {Rs(totalSavings)}</span>}
            </div>
          </div>
        </div>

        {/* Add products button */}
        <button onClick={() => setView('picker')}
          className="w-full h-12 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 border border-blue-600 active:scale-[0.98] transition">
          <span className="material-symbols-outlined text-[22px]">add_circle</span>
          <span>＋ Add Products from Catalog</span>
          <span className="px-2 py-0.5 bg-white/20 text-white rounded text-[11px] font-mono font-semibold ml-1">{PRODUCTS.length} SKUs</span>
        </button>

        {/* Cart items */}
        {cart.length > 0 && (
          <>
            <div className="flex items-center justify-between px-1 pt-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-700">Cart Items</h3>
                <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                  {cart.length} Products · {order.totalUnits} Units
                </span>
              </div>
              <button onClick={() => setView('picker')} className="text-blue-600 font-bold text-xs flex items-center gap-0.5 hover:underline">
                <span className="material-symbols-outlined text-[15px]">add</span> Add More
              </button>
            </div>

            {order.lineItems.map(({ item, calc }) => (
              <div key={item.id} className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm relative space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="pr-6">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-[13px] font-bold text-slate-900">{item.product.name}</h4>
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-mono font-semibold">{item.product.code}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-50 text-slate-500 text-[9.5px]">{item.product.pcsPerCtn} pcs/ctn</span>
                    </div>
                    <div className="flex flex-col gap-1 mt-1.5">
                      <div className="text-[10px] text-teal-700 font-bold bg-teal-50/50 px-1.5 py-1 rounded border border-teal-100/50 leading-tight">
                        Trade {calc.channelOfferPct}% + Slab {activeSlab.pct}% → Landed Rs {calc.landedUnit.toFixed(2)}/unit, Rs {calc.landedDzn.toFixed(2)}/Dzn, Rs {calc.landedCtn.toFixed(2)}/Ctn
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition absolute top-2 right-2">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>

                {/* Qty stepper */}
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

                {/* Financial footer */}
                <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] border-t border-slate-100 text-slate-500 font-medium">
                  <div>
                    <span className="block text-slate-400 text-[9px]">Trade Rate</span>
                    <span className="font-mono text-slate-700">Rs {item.product.tp}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[9px]">Landed/Unit</span>
                    <span className="font-mono font-semibold text-emerald-700">Rs {calc.landedUnit.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-slate-400 text-[9px]">Line Total</span>
                    <span className="font-mono font-bold text-slate-900">{Rs(calc.total)}</span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Remarks */}
        <div className="bg-white rounded-xl p-2.5 border border-slate-200 text-[11px] space-y-1">
          <label className="font-semibold text-slate-700 flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-slate-400">edit_note</span>
            Delivery Remarks (Optional)
          </label>
          <input type="text" placeholder="e.g. Deliver before 12:00 PM" value={remarks} onChange={e => setRemarks(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-3 py-2.5 shadow-2xl z-30 flex items-center justify-between gap-3">
        <div className="flex-1 cursor-pointer" onClick={() => cart.length > 0 && setView('review')}>
          {totalSavings > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
              <span className="material-symbols-outlined text-[13px]">savings</span>
              <span>You Save: {Rs(totalSavings)}</span>
            </div>
          )}
          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Payable:</span>
            <span className="text-base font-extrabold font-mono text-slate-950">{Rs(totalPayable)}</span>
          </div>
          <span className="text-[9.5px] text-slate-400">{order.totalUnits} Units · {cart.length} SKUs</span>
        </div>

        <button onClick={() => cart.length > 0 && setView('review')}
          disabled={cart.length === 0}
          className={`h-11 px-4 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition shrink-0 ${cart.length > 0 ? 'bg-slate-900 hover:bg-black text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
          <span>Review Order</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  )
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-50"><span className="material-symbols-outlined animate-spin text-slate-400 text-3xl">refresh</span></div>}>
      <InvoiceInner />
    </Suspense>
  )
}
