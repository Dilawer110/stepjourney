'use client'
import './invoice.css'
import React, { useMemo, useRef, useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

/* ── Product Master ─────────────────────────────────────────────────── */
interface Product {
  bms: string; sf: string; desc: string; cat: string; sub: string
  gm: number; pcs: number; rate: number; GT: number; MT: number; WS: number
}

const RAW: [string,string,string,string,string,number,number,number,number,number,number][] = [
  ["K26","SKU00003","Munchy Salted 10gm","Munchy","Munchy-10 Gm",10,48,14.75,10.0,0.0,15.0],
  ["K27","SKU00005","Munchy Vegetable 10gm","Munchy","Munchy-10 Gm",10,48,14.75,10.0,0.0,15.0],
  ["K37","SKU00004","Munchy Salted 15gm","Munchy","Munchy-15 Gm",15,36,22.13,2.5,2.5,0.0],
  ["K38","SKU00006","Munchy Vegetable 15gm","Munchy","Munchy-15 Gm",15,36,22.13,2.5,2.5,0.0],
  ["K82","SKU00056","Munchy Salted 25gm","Munchy","Munchy-25 Gm",25,24,36.89,2.5,2.5,0.0],
  ["K83","SKU00069","Munchy Vegetable 25gm","Munchy","Munchy-25 Gm",25,24,36.89,2.5,2.5,0.0],
  ["K35","SKU00034","Salted Peanut 16gm","Peanut","Salted Peanut-16 Gm",16,84,22.13,2.5,0.0,0.0],
  ["K36","SKU00031","Peanut Unsalted 16gm","Peanut","Un Salted Peanut-16 Gm",16,84,22.13,2.5,0.0,0.0],
  ["K86","SKU00065","Masala Peanut 16gm","Peanut","Masala Peanut-16 Gm",16,84,22.13,2.5,0.0,0.0],
  ["K44","SKU00035","Salted Peanut 25gm","Peanut","Salted Peanut-25 Gm",25,48,36.89,2.5,2.5,0.0],
  ["K45","SKU00032","Peanut Unsalted 25gm","Peanut","Un Salted Peanut-25 Gm",25,48,36.89,2.5,2.5,0.0],
  ["K87","SKU00066","Masala Peanut 25gm","Peanut","Masala Peanut-25 Gm",25,48,36.89,2.5,2.5,0.0],
  ["K46","SKU00036","Salted Peanut 40gm","Peanut","Salted Peanut-40 Gm",40,36,59.02,2.5,2.5,0.0],
  ["K47","SKU00033","Peanut Unsalted 40gm","Peanut","Un Salted Peanut-40 Gm",40,36,59.02,2.5,2.5,0.0],
  ["K88","SKU00067","Masala Peanut 40gm","Peanut","Masala Peanut-40 Gm",40,36,59.02,2.5,2.5,0.0],
  ["K70","SKU00037","Daal Sev Box 192gm","Nimko","Daal Sev-192 Gm",192,12,177.05,9.5,0.0,0.0],
  ["K79","SKU00038","P/Stick Chat Pata Box 192gm","Potato Sticks","Potato Sticks-192 Gm",192,12,177.05,9.5,0.0,0.0],
  ["K71","SKU00068","Spicy Mix Nimko Box 192gm","Nimko","Spicy Mix-192 Gm",192,12,177.05,9.5,0.0,0.0],
  ["K72","SKU00039","Nimboo Daal Box 192gm","Nimko","Nimbo Daal-192 Gm",192,12,177.05,9.5,0.0,0.0],
  ["K73","SKU00040","Nimko Mix Hot Spicy Box 192gm","Nimko","Hot & Spicy-192 Gm",192,12,177.05,9.5,0.0,0.0],
  ["A49","SKU00041","Nimko Mix Lemon Chilli Box 192gm","Nimko","Mix Lemon Chilli-192 Gm",192,12,177.05,9.5,0.0,0.0],
  ["K84","SKU00042","Daal Moung Box 216gm","Nimko","Daal Moung-216 Gm",216,12,265.57,9.5,0.0,0.0],
  ["K74","SKU00064","Daal Sev Strip 16gm","Nimko","Daal Sev-16 Gm",16,72,14.75,8.0,0.0,0.0],
  ["K80","SKU00058","P/Stick Chatpata Strip 16gm","Potato Sticks","Potato Sticks-16 Gm",16,72,14.75,8.0,0.0,0.0],
  ["K75","SKU00059","Spicy Mix Strip 16gm","Nimko","Spicy Mix-16 Gm",16,72,14.75,8.0,0.0,0.0],
  ["K76","SKU00060","Nimboo Daal Strip 16gm","Nimko","Nimbo Daal-16 Gm",16,72,14.75,8.0,0.0,0.0],
  ["K81","SKU00061","NM Hot Spicy Strip 16gm","Nimko","Hot & Spicy-16 Gm",16,72,14.75,8.0,0.0,0.0],
  ["K77","SKU00062","NM Lemon Chilli Strip 16gm","Nimko","Mix Lemon Chilli-16 Gm",16,72,14.75,8.0,0.0,0.0],
  ["K78","SKU00063","Daal Moung Strip 18gm","Nimko","Daal Moung-18 Gm",18,72,22.13,8.0,0.0,0.0],
  ["K29","SKU00020","Nimboo Daal 24gm","Nimko","Nimbo Daal-24 Gm",24,48,22.13,3.0,3.0,0.0],
  ["K30","SKU00050","NM Hot n Spicy 24gm","Nimko","Hot & Spicy-24 Gm",24,48,22.13,3.0,3.0,0.0],
  ["K31","SKU00002","P/Stick S&P 24gm","Potato Sticks","Potato Sticks-24 Gm",24,48,22.13,3.0,3.0,0.0],
  ["K32","SKU00051","Lemon Chilli Nimko 24gm","Nimko","Mix Lemon Chilli-24 Gm",24,48,22.13,3.0,3.0,0.0],
  ["K33","SKU00007","Spicy Mix Nimko 24gm","Nimko","Spicy Mix-24 Gm",24,48,22.13,3.0,3.0,0.0],
  ["K34","SKU00012","Daal Sev 24gm","Nimko","Daal Sev-24 Gm",24,48,22.13,3.0,3.0,0.0],
  ["K42","SKU00025","S/Pepper Nimko 40gm","Nimko","Salt & Pepper-40 Gm",40,36,36.89,3.0,3.0,0.0],
  ["K41","SKU00008","Chewra Nimko 30gm","Nimko","Chewra-30 Gm",30,36,36.89,3.0,3.0,0.0],
  ["K39","SKU00010","Daal Moung 30gm","Nimko","Daal Moung-30 Gm",30,48,36.89,3.0,3.0,0.0],
  ["K40","SKU00014","Khat Mitha 30gm","Nimko","Khat Mitha-30 Gm",30,36,36.89,3.0,3.0,0.0],
  ["K43","SKU00013","Karachi Nimko 40gm","Nimko","Karachi-40 Gm",40,36,36.89,3.0,3.0,0.0],
  ["K48","SKU00029","N/Shahi Mix 80gm","Nimko","Shahi Mix-80 Gm",80,36,184.43,2.5,3.0,0.0],
  ["K52","SKU00016","N/Lahori Mix 80gm","Nimko","Lahori Mix-80 Gm",80,36,132.79,2.5,3.0,0.0],
  ["K50","SKU00054","NM Salt n Pepper 80gm","Nimko","Salt & Pepper-80 Gm",80,36,88.52,2.5,3.0,0.0],
  ["K51","SKU00028","N/Shahi Mix 180gm","Nimko","Shahi Mix-180 Gm",180,30,368.85,2.5,3.0,0.0],
  ["K49","SKU00015","N/Lahori Mix 180gm","Nimko","Lahori Mix-180 Gm",180,30,295.08,2.5,3.0,0.0],
  ["K53","SKU00052","Lemon n Chilli 180gm","Nimko","Lemon & Chilli-180 Gm",180,30,199.18,2.5,3.0,0.0],
  ["K54","SKU00019","Masoor Masala 180gm","Nimko","Masoor-180 Gm",180,30,199.18,2.5,3.0,0.0],
  ["K55","SKU00053","NM Salt n Pepper 180gm","Nimko","Salt & Pepper-180 Gm",180,30,199.18,2.5,3.0,0.0],
  ["N/A","SKU00011","Daal Sev (Loose) 16gm","Nimko","Daal Sev-16 Gm",16,72,14.75,8.0,0.0,0.0],
  ["N/A","SKU00001","Potato Stick Chatpata (Loose) 16gm","Potato Sticks","Potato Sticks-16 Gm",16,72,14.75,8.0,0.0,0.0],
  ["N/A","SKU00030","Spicy Mix Nimko (Loose) 16gm","Nimko","Spicy Mix-16 Gm",16,72,14.75,8.0,0.0,0.0],
  ["N/A","SKU00021","Nimboo Daal (Loose) 16gm","Nimko","Nimbo Daal-16 Gm",16,72,14.75,8.0,0.0,0.0],
  ["N/A","SKU00023","Nimko Mix Hot & Spicy (Loose) 16gm","Nimko","Hot & Spicy-16 Gm",16,72,14.75,8.0,0.0,0.0],
  ["N/A","SKU00024","Nimko Mix Lemon & Chilli (Loose) 16gm","Nimko","Mix Lemon Chilli-16 Gm",16,72,14.75,8.0,0.0,0.0],
  ["N/A","SKU00009","Daal Moung (Loose) 18gm","Nimko","Daal Moung-18 Gm",18,72,22.13,8.0,0.0,0.0],
  ["N/A","N/A1","Munchy Plain 15gm","Munchy","Munchy-15 Gm",15,36,22.13,2.5,2.5,0.0],
  ["N/A","N/A2","Munchy Plain 25gm","Munchy","Munchy-25 Gm",25,24,36.89,2.5,2.5,0.0],
]

const PRODUCTS: Product[] = RAW.map(([bms,sf,desc,cat,sub,gm,pcs,rate,GT,MT,WS]) => ({ bms,sf,desc,cat,sub,gm,pcs,rate,GT,MT,WS }))
const PROD_BY_SF = Object.fromEntries(PRODUCTS.map(p => [p.sf, p]))

const SLABS: Record<string, Record<string, {min:number,max:number,pct:number}[]>> = {
  Tier1: {
    GT: [{min:1000,max:1999,pct:2.0},{min:2000,max:Infinity,pct:3.0}],
    MT: [{min:2000,max:Infinity,pct:3.0}],
    WS: [{min:2000,max:3499,pct:3.0},{min:3500,max:Infinity,pct:4.0}],
    INST: [{min:2000,max:Infinity,pct:5.0}],
  },
  Tier2: {
    GT: [{min:1000,max:1999,pct:1.5},{min:2000,max:Infinity,pct:2.5}],
    MT: [{min:2000,max:Infinity,pct:2.0}],
    WS: [{min:2000,max:3499,pct:2.5},{min:3500,max:Infinity,pct:3.5}],
    INST: [{min:2000,max:Infinity,pct:4.0}],
  },
}
const CHANNEL_LABEL: Record<string,string> = { GT:'Retail (GT)', MT:'LMT', WS:'Wholesale', INST:'Institution' }

function fmt(n: number) {
  return 'Rs. ' + (Math.round((n||0)*100)/100).toLocaleString('en-PK', { minimumFractionDigits:2, maximumFractionDigits:2 })
}
function uid() { return 'row' + Math.random().toString(36).slice(2,10) }

interface Line { id:string; sf:string; qty:number; rate:number; unitMode:'units'|'ctn' }

/* ── Product Combobox ────────────────────────────────────────────────── */
function ProductCombobox({ line, onSelect }: { line:Line; onSelect:(sf:string)=>void }) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [rect, setRect] = useState<DOMRect|null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const prod = PROD_BY_SF[line.sf]
  const displayValue = focused ? query : prod ? `${prod.sf} — ${prod.desc}` : ''

  const matches = useMemo(() => {
    const t = (focused ? query : '').trim().toLowerCase()
    const pool = !t ? PRODUCTS : PRODUCTS.filter(p =>
      p.sf.toLowerCase().includes(t) ||
      p.bms.toLowerCase().includes(t) ||
      p.desc.toLowerCase().includes(t) ||
      p.cat.toLowerCase().includes(t) ||
      p.sub.toLowerCase().includes(t)
    )
    return pool.slice(0, 10)
  }, [query, focused])

  function updateRect() {
    if (inputRef.current) setRect(inputRef.current.getBoundingClientRect())
  }

  const dropdownStyle: React.CSSProperties | undefined = rect ? {
    left: Math.min(rect.left, window.innerWidth - Math.max(rect.width, 260) - 8),
    top: rect.bottom + 4,
    width: Math.max(rect.width, 260),
  } : undefined

  return (
    <td className="ib-prod-cell">
      <input
        ref={inputRef}
        type="text"
        className="ib-prod-search"
        autoComplete="off"
        placeholder="Type SF / BMS code or name…"
        value={displayValue}
        onChange={e => { setQuery(e.target.value); updateRect() }}
        onFocus={() => { setQuery(''); setFocused(true); updateRect() }}
        onBlur={() => setTimeout(() => setFocused(false), 160)}
      />
      {focused && (
        <div className="ib-prod-dropdown" style={dropdownStyle}>
          {matches.length === 0
            ? <div className="ib-dd-empty">No matching products</div>
            : matches.map(p => (
              <div key={p.sf} className="ib-dd-item" onMouseDown={() => { onSelect(p.sf); setFocused(false) }}>
                <span className="ib-dd-sf">{p.sf} · {p.bms}</span>
                <span className="ib-dd-desc">{p.desc}</span>
                <span className="ib-dd-cat">{p.cat} — {p.sub}</span>
              </div>
            ))
          }
        </div>
      )}
    </td>
  )
}

/* ── Main Invoice Form ───────────────────────────────────────────────── */
function InvoiceFormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const outletId = searchParams.get('id')
  const [outlet, setOutlet] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [savedInvNo, setSavedInvNo] = useState('')

  const [header, setHeader] = useState({
    invNo: 'INV-' + String(Math.floor(1000+Math.random()*9000)),
    invDate: new Date().toISOString().slice(0,10),
    orderBooker: '', salesman: '',
    custId: '', custName: '',
    channel: 'GT', area: '', tier: 'Tier1',
    strnRegistered: false, remarks: '',
  })

  const [lines, setLines] = useState<Line[]>([
    {id:uid(),sf:'',qty:0,rate:0,unitMode:'units'},
    {id:uid(),sf:'',qty:0,rate:0,unitMode:'units'},
    {id:uid(),sf:'',qty:0,rate:0,unitMode:'units'},
  ])

  useEffect(() => {
    if (!outletId) return
    supabase.from('outlets').select('*, routes(name)').eq('id', outletId).single()
      .then(({ data }) => {
        if (data) {
          setOutlet(data)
          setHeader(h => ({
            ...h,
            custId: data.code || '',
            custName: data.name || '',
            area: data.sub_channel || data.channel || '',
          }))
        }
      })
  }, [outletId])

  function setField(key: string, value: unknown) {
    setHeader(h => ({ ...h, [key]: value }))
  }
  function updateLine(id: string, patch: Partial<Line>) {
    setLines(ls => ls.map(l => l.id===id ? {...l,...patch} : l))
  }
  function addLine() { setLines(ls => [...ls, {id:uid(),sf:'',qty:0,rate:0,unitMode:'units'}]) }
  function removeLine(id: string) { setLines(ls => ls.filter(l=>l.id!==id)) }
  function selectProduct(id: string, sf: string) {
    const prod = PROD_BY_SF[sf]
    updateLine(id, { sf, rate: prod ? prod.rate : 0 })
  }

  /* ── Calculations ─── */
  const calc = useMemo(() => {
    const { channel, tier, strnRegistered } = header
    const tradeKey = channel === 'INST' ? null : channel

    let subtotal = 0, tradeDiscTotal = 0
    lines.forEach(l => {
      const prod = PROD_BY_SF[l.sf]
      const units = prod && l.unitMode === 'ctn' ? (l.qty||0)*prod.pcs : (l.qty||0)
      const total = units * (l.rate||0)
      const discPct = prod && tradeKey ? (prod as any)[tradeKey]||0 : 0
      subtotal += total
      tradeDiscTotal += (total*discPct)/100
    })

    const brackets = (SLABS[tier]?.[channel]) || []
    let current: {min:number,max:number,pct:number}|null = null
    let next: {min:number,max:number,pct:number}|null = null
    brackets.forEach(b => { if (subtotal>=b.min && subtotal<=b.max) current=b })
    brackets.forEach(b => { if (subtotal<b.min && !next) next=b })
    const slabPct = current ? current.pct : 0
    const slabVal = (subtotal*slabPct)/100
    const grandDisc = tradeDiscTotal + slabVal
    const net = subtotal - grandDisc

    const GST_PCT = strnRegistered ? 18 : 22
    const ADV_PCT = strnRegistered ? 0.5 : 2.5
    const gstVal = (net*GST_PCT)/100
    const invoiceAmt = net + gstVal
    const advTax = (invoiceAmt*ADV_PCT)/100
    const totalPayable = invoiceAmt + advTax

    const perLine: Record<string,{unitCost:number,cartonCost:number}> = {}
    lines.forEach(l => {
      const prod = PROD_BY_SF[l.sf]
      if (!prod) { perLine[l.id]={unitCost:0,cartonCost:0}; return }
      const tradePct = tradeKey ? (prod as any)[tradeKey]||0 : 0
      const combinedPct = tradePct + slabPct
      const netRate = (l.rate||0)*(1-combinedPct/100)
      const gstPerUnit = (netRate*GST_PCT)/100
      const invPerUnit = netRate + gstPerUnit
      const advPerUnit = (invPerUnit*ADV_PCT)/100
      const unitCost = invPerUnit + advPerUnit
      perLine[l.id] = { unitCost, cartonCost: unitCost*prod.pcs }
    })

    let gauge = { pct:0, note:'Add line items to see slab standing' }
    if (subtotal > 0) {
      if (next) {
        const lower = current ? current.min : 0
        const span = next.min - lower
        const progressed = subtotal - lower
        const pct = Math.max(4, Math.min(100, (progressed/span)*100))
        gauge = { pct, note:`Rs. ${Math.round(next.min-subtotal).toLocaleString('en-PK')} more unlocks ${next.pct.toFixed(1)}% slab` }
      } else {
        gauge = { pct:100, note:`Top slab reached — ${slabPct.toFixed(1)}% applied` }
      }
    }

    return { subtotal, tradeDiscTotal, slabPct, slabVal, grandDisc, net, GST_PCT, gstVal, invoiceAmt, ADV_PCT, advTax, totalPayable, perLine, gauge }
  }, [lines, header])

  async function handleSubmitOrder() {
    const filledLines = lines.filter(l => l.sf && l.qty > 0)
    if (filledLines.length === 0) { alert('Please add at least one product with a quantity.'); return }
    setSubmitting(true)
    const { data: { session } } = await supabase.auth.getSession()
    try {
      await supabase.from('orders').insert({
        invoice_no: header.invNo,
        invoice_date: header.invDate,
        outlet_id: outletId,
        order_booker_id: session?.user?.id || null,
        customer_name: header.custName,
        channel: header.channel,
        area: header.area,
        tier: header.tier,
        strn_registered: header.strnRegistered,
        remarks: header.remarks,
        lines: filledLines,
        subtotal: calc.subtotal,
        trade_discount: calc.tradeDiscTotal,
        slab_discount: calc.slabVal,
        net_amount: calc.net,
        gst_amount: calc.gstVal,
        advance_tax: calc.advTax,
        total_payable: calc.totalPayable,
        status: 'submitted',
      })
      if (outletId && session?.user?.id) {
        await supabase.from('outlet_visits').upsert({
          outlet_id: outletId, order_booker_id: session.user.id,
          visit_date: new Date().toISOString().slice(0,10),
          status: 'billed', visited_at: new Date().toISOString(),
        }, { onConflict: 'outlet_id,visit_date' })
      }
      setSavedInvNo(header.invNo)
      setSubmitted(true)
      setTimeout(() => router.push('/'), 2500)
    } catch (err) {
      console.error(err)
      alert('Failed to submit order. Please try again.')
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ display:'flex', flexDirection:'column', height:'100vh', maxWidth:480, margin:'0 auto', alignItems:'center', justifyContent:'center', background:'#f0fdf4', padding:32, textAlign:'center' }}>
        <div style={{ width:80, height:80, borderRadius:'50%', background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:24 }}>
          <span className="material-symbols-outlined" style={{ fontSize:48, color:'#16a34a', fontVariationSettings:"'FILL' 1" }}>check_circle</span>
        </div>
        <h2 style={{ fontWeight:800, fontSize:22, color:'#14532d', margin:'0 0 8px' }}>Order Submitted!</h2>
        <p style={{ color:'#166534', fontWeight:600, marginBottom:4 }}>Invoice # {savedInvNo}</p>
        <p style={{ color:'#4ade80', fontSize:13, fontWeight:600 }}>Total Payable: {fmt(calc.totalPayable)}</p>
        <p style={{ color:'#86efac', fontSize:12, marginTop:16 }}>Redirecting back to outlets...</p>
      </div>
    )
  }

  return (
    <div className="ib-page">
      <div className="ib-sheet">

        {/* HEADER BAND */}
        <div className="ib-band">
          <button className="ib-back-btn" onClick={() => router.back()}>
            ← Back to Outlets
          </button>
          <div className="ib-band-top">
            <div>
              <p className="ib-eyebrow">Distributor / Trade Invoice</p>
              <h1 className="ib-h1">
                {outlet ? outlet.name : 'Customer Invoice'}
              </h1>
              {outlet && <p style={{ margin:'4px 0 0', fontSize:12, color:'var(--ib-ink-soft)', fontFamily:"'IBM Plex Mono', monospace" }}>{outlet.code}</p>}
            </div>
            <div className="ib-band-meta">
              <div className="ib-row">
                <label>Invoice #</label>
                <input value={header.invNo} onChange={e => setField('invNo', e.target.value)} />
              </div>
              <div className="ib-row">
                <label>Date</label>
                <input type="date" value={header.invDate} onChange={e => setField('invDate', e.target.value)} />
              </div>
              <div className="ib-row">
                <label>Order Booker</label>
                <input value={header.orderBooker} onChange={e => setField('orderBooker', e.target.value)} placeholder="Name" />
              </div>
              <div className="ib-row">
                <label>Salesman</label>
                <input value={header.salesman} onChange={e => setField('salesman', e.target.value)} placeholder="Name" />
              </div>
            </div>
          </div>
        </div>

        {/* CUSTOMER / CHANNEL */}
        <div className="ib-info-grid">
          <div className="ib-info-col">
            <div className="ib-field">
              <label>Customer ID</label>
              <input value={header.custId} onChange={e => setField('custId', e.target.value)} placeholder="Outlet Code" />
            </div>
            <div className="ib-field">
              <label>Customer Name</label>
              <input value={header.custName} onChange={e => setField('custName', e.target.value)} placeholder="Shop / Outlet name" />
            </div>
            <div className="ib-two-up">
              <div className="ib-field">
                <label>Channel</label>
                <select value={header.channel} onChange={e => setField('channel', e.target.value)}>
                  <option value="GT">GT — Retail</option>
                  <option value="MT">MT / LMT</option>
                  <option value="WS">WS — Wholesale</option>
                  <option value="INST">Institution</option>
                </select>
              </div>
              <div className="ib-field">
                <label>Area / Town</label>
                <input value={header.area} onChange={e => setField('area', e.target.value)} placeholder="e.g. Model Town" />
              </div>
            </div>
          </div>
          <div className="ib-info-col">
            <div className="ib-field">
              <label>Town Tier (slab discount)</label>
              <select value={header.tier} onChange={e => setField('tier', e.target.value)}>
                <option value="Tier1">Tier 1 Town</option>
                <option value="Tier2">Tier 2 Town</option>
              </select>
            </div>
            <div className="ib-field">
              <label>Tax Status</label>
              <label className="ib-checkbox-row">
                <input type="checkbox" checked={header.strnRegistered} onChange={e => setField('strnRegistered', e.target.checked)} />
                STRN Registered (Sales Tax Registered)
              </label>
            </div>
            <div className="ib-field">
              <label>Remarks</label>
              <input value={header.remarks} onChange={e => setField('remarks', e.target.value)} placeholder="Optional note" />
            </div>
          </div>
        </div>

        {/* SLAB GAUGE */}
        <div className="ib-gauge-wrap">
          <div className="ib-gauge-card">
            <span className="ib-gauge-label">Slab Progress</span>
            <div className="ib-gauge-track">
              <div className="ib-gauge-fill" style={{ width:`${calc.gauge.pct}%` }} />
            </div>
            <span className="ib-gauge-note">{calc.gauge.note}</span>
          </div>
        </div>

        {/* LINE ITEMS TABLE */}
        <div className="ib-table-wrap">
          <div className="ib-scroll-hint">↔ Swipe to see all columns</div>
          <div className="ib-table-scroll">
            <table>
              <thead>
                <tr>
                  <th style={{ width:260 }}>Product (search SF / BMS / name)</th>
                  <th className="ib-num" style={{ width:140 }}>Qty</th>
                  <th className="ib-num" style={{ width:120 }} title="Landed cost per unit after all discounts, GST & tax">Unit Cost</th>
                  <th className="ib-num" style={{ width:130 }} title="Landed cost per carton">Carton Cost</th>
                  <th style={{ width:30 }} />
                </tr>
              </thead>
              <tbody>
                {lines.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--ib-ink-soft)', padding:'22px 0' }}>No products added — click "Add product line" below.</td></tr>
                ) : lines.map(l => {
                  const prod = PROD_BY_SF[l.sf]
                  const lc = calc.perLine[l.id] || { unitCost:0, cartonCost:0 }
                  return (
                    <tr key={l.id}>
                      <ProductCombobox line={l} onSelect={sf => selectProduct(l.id, sf)} />
                      <td className="ib-num ib-qty-cell">
                        <div className="ib-qty-wrap">
                          <input
                            type="number" min="0" className="ib-qty-input"
                            value={l.qty||''} placeholder="0"
                            onChange={e => updateLine(l.id, { qty: parseFloat(e.target.value)||0 })}
                          />
                          <div className="ib-unit-toggle">
                            <button type="button" className={`ib-ut-btn ${l.unitMode==='units'?'active':''}`}
                              onClick={() => updateLine(l.id, { unitMode:'units' })}>Units</button>
                            <button type="button" className={`ib-ut-btn ${l.unitMode==='ctn'?'active':''}`}
                              onClick={() => updateLine(l.id, { unitMode:'ctn' })}>Ctn</button>
                          </div>
                        </div>
                        {prod && <div className="ib-pack-hint">{prod.pcs} units / ctn</div>}
                      </td>
                      <td className="ib-num">{lc.unitCost > 0 ? fmt(lc.unitCost) : '—'}</td>
                      <td className="ib-num">{lc.cartonCost > 0 ? fmt(lc.cartonCost) : '—'}</td>
                      <td>
                        <button className="ib-rm-btn" title="Remove line" onClick={() => removeLine(l.id)}>✕</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <button className="ib-add-row-btn" onClick={addLine}>+ Add product line</button>
        </div>

        {/* SUMMARY */}
        <div className="ib-bottom">
          <div className="ib-summary">
            <div className="ib-srow"><span>Subtotal (Gross, Excl. GST)</span><span className="ib-v">{fmt(calc.subtotal)}</span></div>
            <div className="ib-srow ib-discount"><span>Trade Discount (offer)</span><span className="ib-v">− {fmt(calc.tradeDiscTotal)}</span></div>
            <div className="ib-srow ib-discount">
              <span>Slab Discount — {CHANNEL_LABEL[header.channel]} ({calc.slabPct.toFixed(1)}%)</span>
              <span className="ib-v">− {fmt(calc.slabVal)}</span>
            </div>
            <div className="ib-srow ib-grand ib-divider"><span>Grand Total Discount</span><span className="ib-v">{fmt(calc.grandDisc)}</span></div>
            <div className="ib-srow"><span>Net Amount (Excl. GST)</span><span className="ib-v">{fmt(calc.net)}</span></div>
            <div className="ib-srow">
              <span>GST {header.strnRegistered ? '(STRN — 18%)' : '(Unregistered — 22%)'}</span>
              <span className="ib-v">{fmt(calc.gstVal)}</span>
            </div>
            <div className="ib-srow">
              <span>Advance Tax Sec. 236H ({calc.ADV_PCT}%)</span>
              <span className="ib-v">{fmt(calc.advTax)}</span>
            </div>
            <div className="ib-srow ib-grand ib-divider"><span>Total Payable</span><span className="ib-v">{fmt(calc.totalPayable)}</span></div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="ib-toolbar">
          <button className="ib-btn" onClick={() => window.print()}>🖨 Print / Save PDF</button>
          <button className="ib-btn" onClick={() => {
            if (window.confirm('Save as draft without submitting?')) router.push('/')
          }}>Save Draft</button>
          <button
            className="ib-btn ib-primary"
            disabled={submitting || calc.totalPayable === 0}
            onClick={handleSubmitOrder}
          >
            {submitting ? 'Submitting…' : `Submit Order — ${fmt(calc.totalPayable)}`}
          </button>
        </div>

      </div>
    </div>
  )
}

export default function OrderPage() {
  return (
    <Suspense fallback={
      <div style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center' }}>
        <span className="material-symbols-outlined animate-spin" style={{ fontSize:32, color:'#94a3b8' }}>refresh</span>
      </div>
    }>
      <InvoiceFormInner />
    </Suspense>
  )
}
