'use client'
import { useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// ─── Reusable pill-rating (1-5 + N/A) ───────────────────────────────────────
function RatingPills({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (v: string) => void
  label: string
}) {
  const pills = ['1', '2', '3', '4', '5', 'N/A']
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[13px] font-semibold text-slate-800">{label}</span>
        {value ? (
          <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-1.5 rounded">
            Rating: {value}
          </span>
        ) : (
          <span className="text-[11px] font-medium text-slate-400">Select rating</span>
        )}
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {pills.map((p) => {
          const active = value === p
          return (
            <button
              key={p}
              type="button"
              onClick={() => onChange(active ? '' : p)}
              className={
                'pill-btn transition-all duration-150 font-bold rounded-lg ' +
                (p === 'N/A' ? 'min-w-[48px] h-[34px] px-2 text-[12px] font-semibold ' : 'min-w-[42px] h-[34px] px-2 text-[12.5px] ') +
                (active
                  ? 'bg-blue-700 text-white border border-blue-700 ring-2 ring-blue-600/20 shadow-sm'
                  : p === 'N/A'
                  ? 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50')
              }
            >
              {p}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Y / N / NA grid ─────────────────────────────────────────────────────────
function YNNAPills({
  value,
  onChange,
  label,
  options = ['Yes', 'No', 'N/A'],
}: {
  value: string
  onChange: (v: string) => void
  label: string
  options?: string[]
}) {
  return (
    <div>
      <span className="text-[13px] font-semibold text-slate-800 block mb-1.5">{label}</span>
      <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((opt) => {
          const active = value === opt
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(active ? '' : opt)}
              className={
                'pill-btn h-[35px] font-bold text-[12.5px] rounded-lg flex items-center justify-center gap-1 transition-all ' +
                (active
                  ? 'bg-blue-700 text-white border border-blue-700 shadow-sm'
                  : opt === 'N/A' || opt === 'No Complaint'
                  ? 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 font-semibold text-[11.5px]'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-semibold')
              }
            >
              {active && opt === 'Yes' && (
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
              )}
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Multi-select chip grid (2-col) ──────────────────────────────────────────
function MultiChips({
  label,
  options,
  selected,
  onChange,
  accentClass = 'bg-purple-100 text-purple-950 border-purple-300',
  iconClass = 'text-purple-700',
  countClass = 'text-purple-700',
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
  accentClass?: string
  iconClass?: string
  countClass?: string
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((x) => x !== opt))
    } else {
      onChange([...selected, opt])
    }
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <span className={`text-[11px] font-semibold ${countClass}`}>{selected.length} Selected</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={
                'pill-btn text-left p-2.5 rounded-lg text-[12px] flex items-center justify-between transition-all ' +
                (isSelected
                  ? `font-semibold ${accentClass}`
                  : 'font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50')
              }
            >
              <span>{opt}</span>
              <span className={`material-symbols-outlined text-[16px] ${isSelected ? iconClass : 'text-slate-300'}`}>
                {isSelected ? 'check_circle' : 'radio_button_unchecked'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Section card shell ───────────────────────────────────────────────────────
function SectionCard({
  borderColor,
  headerBg = 'bg-slate-100',
  icon,
  iconColor,
  title,
  badgeText,
  badgeClass,
  children,
}: {
  borderColor: string
  headerBg?: string
  icon: string
  iconColor: string
  title: string
  badgeText: string
  badgeClass: string
  children: React.ReactNode
}) {
  return (
    <section
      className={`bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden`}
      style={{ borderLeft: `4px solid` }}
    >
      <div
        className={`bg-white rounded-xl shadow-sm border-l-[4px] ${borderColor} border border-slate-200/80 overflow-hidden`}
      >
        <div className={`${headerBg} px-3.5 py-2 border-b border-slate-200 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined ${iconColor} text-[18px]`}>{icon}</span>
            <span className="text-[0.875rem] font-bold text-slate-800 tracking-tight uppercase">{title}</span>
          </div>
          <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full border ${badgeClass}`}>{badgeText}</span>
        </div>
        <div className="p-3.5 space-y-3.5">{children}</div>
      </div>
    </section>
  )
}

// ─── Divider-aware item wrapper ───────────────────────────────────────────────
function Item({ first = false, children }: { first?: boolean; children: React.ReactNode }) {
  return <div className={first ? '' : 'pt-2.5 border-t border-slate-100'}>{children}</div>
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN FORM
// ═══════════════════════════════════════════════════════════════════════════════
function SalesOfficerAssessmentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const outletCode = searchParams.get('id') || 'N00000003337'
  const outletName = searchParams.get('name') || 'Al Madina General Store'
  const route = searchParams.get('route') || 'VAN-04'
  const channel = searchParams.get('channel') || 'GT Retail'
  const auditor = searchParams.get('auditor') || 'Tariq Mehmood'

  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [obsChars, setObsChars] = useState(0)

  // ── Rating fields (1-5 / N/A) ───────────────────────────────────────────
  const [meetGreet, setMeetGreet] = useState('')
  const [professionalOpening, setProfessionalOpening] = useState('')
  const [relevantSKUs, setRelevantSKUs] = useState('')
  const [properCallSeq, setProperCallSeq] = useState('')
  const [basicCallProc, setBasicCallProc] = useState('')
  const [customerNeed, setCustomerNeed] = useState('')
  const [orderSuggested, setOrderSuggested] = useState('')
  const [interactionRel, setInteractionRel] = useState('')
  const [objections, setObjections] = useState('')

  // ── Y/N/NA / multi-option fields ────────────────────────────────────────
  const [productCatalog, setProductCatalog] = useState('')
  const [punctuality, setPunctuality] = useState('')
  const [timeSpent, setTimeSpent] = useState('')
  const [displayChecked, setDisplayChecked] = useState('')
  const [displayImprove, setDisplayImprove] = useState('')
  const [visibilityImproved, setVisibilityImproved] = useState('')
  const [expiredChecked, setExpiredChecked] = useState('')
  const [nearExpiryChecked, setNearExpiryChecked] = useState('')
  const [fifoChecked, setFifoChecked] = useState('')
  const [complaintFollowUp, setComplaintFollowUp] = useState('')
  const [deliveryFollowUp, setDeliveryFollowUp] = useState('')
  const [shortDelivery, setShortDelivery] = useState('')
  const [orderConfirmed, setOrderConfirmed] = useState('')
  const [nextActionAgreed, setNextActionAgreed] = useState('')
  const [coachingRequired, setCoachingRequired] = useState('')
  const [coachingArea, setCoachingArea] = useState<string[]>([])
  const [nextStep, setNextStep] = useState<string[]>([])
  const [observation, setObservation] = useState('')

  // ── Completed / total / auditScore ────────────────────────────────────
  const allFields = useMemo(() => ({
    meetGreet,
    professionalOpening,
    productCatalog,
    relevantSKUs,
    properCallSeq,
    basicCallProc,
    customerNeed,
    orderSuggested,
    interactionRel,
    objections,
    punctuality,
    timeSpent,
    displayChecked,
    displayImprove,
    visibilityImproved,
    expiredChecked,
    nearExpiryChecked,
    fifoChecked,
    complaintFollowUp,
    deliveryFollowUp,
    shortDelivery,
    orderConfirmed,
    nextActionAgreed,
    coachingRequired,
    coachingArea: coachingArea.length > 0 ? 'filled' : '',
    nextStep: nextStep.length > 0 ? 'filled' : '',
    observation: observation.trim().length >= 20 ? 'filled' : '',
  }), [
    meetGreet, professionalOpening, productCatalog, relevantSKUs, properCallSeq,
    basicCallProc, customerNeed, orderSuggested, interactionRel, objections,
    punctuality, timeSpent, displayChecked, displayImprove, visibilityImproved,
    expiredChecked, nearExpiryChecked, fifoChecked, complaintFollowUp, deliveryFollowUp,
    shortDelivery, orderConfirmed, nextActionAgreed, coachingRequired, coachingArea,
    nextStep, observation,
  ])

  const totalCount = Object.keys(allFields).length // 27
  const completedCount = useMemo(
    () => Object.values(allFields).filter(Boolean).length,
    [allFields]
  )
  const progressPct = Math.round((completedCount / totalCount) * 100)

  // Audit score: avg of numeric ratings * 20
  const numericRatingFields = [meetGreet, professionalOpening, relevantSKUs, properCallSeq, basicCallProc, customerNeed, orderSuggested, interactionRel, objections]
  const auditScore = useMemo(() => {
    const numeric = numericRatingFields.filter(v => v && v !== 'N/A').map(Number)
    if (numeric.length === 0) return 0
    const avg = numeric.reduce((a, b) => a + b, 0) / numeric.length
    return Math.round(avg * 20)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetGreet, professionalOpening, relevantSKUs, properCallSeq, basicCallProc, customerNeed, orderSuggested, interactionRel, objections])

  // ── Submit ───────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setSaving(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const payload = {
        outlet_code: outletCode,
        meet_greet: meetGreet,
        professional_opening: professionalOpening,
        product_catalog: productCatalog,
        relevant_skus: relevantSKUs,
        proper_call_seq: properCallSeq,
        basic_call_proc: basicCallProc,
        customer_need: customerNeed,
        order_suggested: orderSuggested,
        interaction_rel: interactionRel,
        objections,
        punctuality,
        time_spent: timeSpent,
        display_checked: displayChecked,
        display_improve: displayImprove,
        visibility_improved: visibilityImproved,
        expired_checked: expiredChecked,
        near_expiry_checked: nearExpiryChecked,
        fifo_checked: fifoChecked,
        complaint_follow_up: complaintFollowUp,
        delivery_follow_up: deliveryFollowUp,
        short_delivery: shortDelivery,
        order_confirmed: orderConfirmed,
        next_action_agreed: nextActionAgreed,
        coaching_required: coachingRequired,
        coaching_area: coachingArea,
        next_step: nextStep,
        observation,
        audit_score: auditScore,
        user_id: session?.user?.id || 'offline',
        created_at: new Date().toISOString(),
      }

      const lsKey = `so_assessment_${new Date().toISOString().split('T')[0]}`
      const existing = JSON.parse(localStorage.getItem(lsKey) || '[]')
      existing.push(payload)
      localStorage.setItem(lsKey, JSON.stringify(existing))

      if (session) {
        await supabase.from('sales_officer_assessment').insert(payload)
      }

      setSuccess(true)
      setTimeout(() => router.push('/'), 2000)
    } catch (e: unknown) {
      setError((e as Error).message || 'Failed to save assessment')
    }
    setSaving(false)
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#0f294a] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Assessment Submitted</h2>
        <p className="text-slate-400 text-sm">Sales Officer Assessment recorded successfully.</p>
      </div>
    )
  }

  return (
    <div className="max-w-[420px] mx-auto bg-[#f8fafc] min-h-screen relative shadow-2xl border-x border-slate-200/60 pb-28 font-sans antialiased">

      {/* ── 1. STICKY HEADER ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#0f294a] text-white px-4 py-3.5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 active:bg-white/20 transition text-slate-200"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-[16px] font-bold tracking-tight text-white leading-tight">S.O. / O.B. Assessment</h1>
              <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-400/30">FIELD QC</span>
            </div>
            <p className="text-[11.5px] text-slate-300 font-normal flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-emerald-400">store</span>
              <span>{outletName} · {route}</span>
            </p>
          </div>
        </div>
        <button type="button" className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-slate-300">
          <span className="material-symbols-outlined text-[20px]">help_outline</span>
        </button>
      </header>

      {/* ── 2. PROGRESS STRIP ────────────────────────────────────────────── */}
      <div className="sticky top-[61px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
            <span className="material-symbols-outlined text-[19px]">fact_check</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Evaluation Progress</span>
              <span className="text-[13px] font-extrabold text-blue-700">{completedCount} / {totalCount} Completed</span>
            </div>
            <div className="w-40 bg-slate-100 rounded-full h-1.5 mt-0.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-tight">Audit Score</span>
          <span className="text-[14px] font-black text-emerald-600 tracking-tight bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {auditScore}%
          </span>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main className="p-3.5 space-y-3.5">

        {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">{error}</div>}

        {/* ── SESSION INFO CARD ────────────────────────────────────────────── */}
        <section className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Active Audit Session</span>
            </div>
            <span className="text-[11px] font-medium text-slate-400">Ref: ASM-2026-0920</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            {[
              { label: 'Assessment Date', icon: 'calendar_today', val: today },
              { label: 'Area Manager / Auditor', icon: 'person', val: auditor },
              { label: 'Outlet & Channel', icon: 'storefront', val: `${outletName} (${channel})` },
              { label: 'Outlet Code / Route', icon: 'qr_code', val: `${outletCode} · ${route}` },
            ].map(({ label, icon, val }) => (
              <div key={label} className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{label}</span>
                <div className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[14px] text-blue-600">{icon}</span>
                  <span className="truncate">{val}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── OPENING (indigo) ─────────────────────────────────────────────── */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200/80 border-l-[4px] border-l-indigo-600 overflow-hidden">
          <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 text-[18px]">waving_hand</span>
              <span className="text-[0.875rem] font-bold text-slate-800 tracking-tight uppercase">Opening</span>
            </div>
            <span className="text-[10.5px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">2 Items</span>
          </div>
          <div className="p-3.5 space-y-3.5">
            <Item first>
              <RatingPills label="Meet & Greet" value={meetGreet} onChange={setMeetGreet} />
            </Item>
            <Item>
              <RatingPills label="Professional Opening of Call" value={professionalOpening} onChange={setProfessionalOpening} />
            </Item>
          </div>
        </section>

        {/* ── SELLING PROCESS (blue) ───────────────────────────────────────── */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200/80 border-l-[4px] border-l-blue-600 overflow-hidden">
          <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">shopping_cart_checkout</span>
              <span className="text-[0.875rem] font-bold text-slate-800 tracking-tight uppercase">Selling Process</span>
            </div>
            <span className="text-[10.5px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">6 Items</span>
          </div>
          <div className="p-3.5 space-y-3.5">
            <Item first>
              <YNNAPills label="Product Catalog Used" value={productCatalog} onChange={setProductCatalog} />
            </Item>
            <Item>
              <RatingPills label="Relevant SKUs / Offers Explained" value={relevantSKUs} onChange={setRelevantSKUs} />
            </Item>
            <Item>
              <RatingPills label="Proper Call Sequence Followed" value={properCallSeq} onChange={setProperCallSeq} />
            </Item>
            <Item>
              <RatingPills label="Basic Call Procedure Complied" value={basicCallProc} onChange={setBasicCallProc} />
            </Item>
            <Item>
              <RatingPills label="Customer Need Properly Probed" value={customerNeed} onChange={setCustomerNeed} />
            </Item>
            <Item>
              <RatingPills label="Appropriate Order Suggested" value={orderSuggested} onChange={setOrderSuggested} />
            </Item>
          </div>
        </section>

        {/* ── CUSTOMER HANDLING (emerald) ──────────────────────────────────── */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200/80 border-l-[4px] border-l-emerald-600 overflow-hidden">
          <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">support_agent</span>
              <span className="text-[0.875rem] font-bold text-slate-800 tracking-tight uppercase">Customer Handling</span>
            </div>
            <span className="text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">2 Items</span>
          </div>
          <div className="p-3.5 space-y-3.5">
            <Item first>
              <RatingPills label="Interaction & Relationship" value={interactionRel} onChange={setInteractionRel} />
            </Item>
            <Item>
              <RatingPills label="Customer Objections Handled" value={objections} onChange={setObjections} />
            </Item>
          </div>
        </section>

        {/* ── VISIT EXECUTION (amber) ──────────────────────────────────────── */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200/80 border-l-[4px] border-l-amber-500 overflow-hidden">
          <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-[18px]">schedule</span>
              <span className="text-[0.875rem] font-bold text-slate-800 tracking-tight uppercase">Visit Execution</span>
            </div>
            <span className="text-[10.5px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">2 Items</span>
          </div>
          <div className="p-3.5 space-y-3.5">
            <Item first>
              <span className="text-[13px] font-semibold text-slate-800 block mb-1.5">Punctuality of This Outlet Visit</span>
              <div className="grid grid-cols-2 gap-2">
                {['Regular', 'Occasional', 'Irregular', 'Missed Completely'].map((opt) => {
                  const active = punctuality === opt
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPunctuality(active ? '' : opt)}
                      className={
                        'pill-btn h-[36px] rounded-lg text-[12px] flex items-center justify-center gap-1 transition-all ' +
                        (active
                          ? 'bg-blue-700 text-white border border-blue-700 font-bold shadow-sm'
                          : opt === 'Missed Completely'
                          ? 'bg-white text-rose-600 border border-slate-200 hover:bg-rose-50 font-semibold'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-semibold')
                      }
                    >
                      {active && <span className="material-symbols-outlined text-[15px]">verified</span>}
                      {opt}
                    </button>
                  )
                })}
              </div>
            </Item>
            <Item>
              <span className="text-[13px] font-semibold text-slate-800 block mb-1.5">Appropriate Time Spent at Shop</span>
              <div className="grid grid-cols-3 gap-2">
                {['Short', 'Appropriate', 'Excessive'].map((opt) => {
                  const active = timeSpent === opt
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setTimeSpent(active ? '' : opt)}
                      className={
                        'pill-btn h-[35px] rounded-lg text-[12px] flex items-center justify-center gap-1 transition-all ' +
                        (active
                          ? 'bg-blue-700 text-white border border-blue-700 font-bold shadow-sm'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-semibold')
                      }
                    >
                      {active && opt === 'Appropriate' && <span className="material-symbols-outlined text-[15px]">timer</span>}
                      {opt}
                    </button>
                  )
                })}
              </div>
            </Item>
          </div>
        </section>

        {/* ── MERCHANDISING (violet) ───────────────────────────────────────── */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200/80 border-l-[4px] border-l-violet-600 overflow-hidden">
          <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-violet-600 text-[18px]">view_in_ar</span>
              <span className="text-[0.875rem] font-bold text-slate-800 tracking-tight uppercase">Merchandising</span>
            </div>
            <span className="text-[10.5px] font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">3 Items</span>
          </div>
          <div className="p-3.5 space-y-3.5">
            <Item first>
              <YNNAPills label="Display / Merchandising Checked" value={displayChecked} onChange={setDisplayChecked} />
            </Item>
            <Item>
              <YNNAPills label="Display Improvement Attempted" value={displayImprove} onChange={setDisplayImprove} />
            </Item>
            <Item>
              <YNNAPills label="Product Visibility Improved" value={visibilityImproved} onChange={setVisibilityImproved} />
            </Item>
          </div>
        </section>

        {/* ── STOCK HEALTH (orange) ────────────────────────────────────────── */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200/80 border-l-[4px] border-l-orange-500 overflow-hidden">
          <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-600 text-[18px]">inventory_2</span>
              <span className="text-[0.875rem] font-bold text-slate-800 tracking-tight uppercase">Stock Health</span>
            </div>
            <span className="text-[10.5px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">3 Items</span>
          </div>
          <div className="p-3.5 space-y-3.5">
            <Item first>
              <YNNAPills label="Expired Stock Checked" value={expiredChecked} onChange={setExpiredChecked} />
            </Item>
            <Item>
              <YNNAPills label="Near-Expiry Stock Checked" value={nearExpiryChecked} onChange={setNearExpiryChecked} />
            </Item>
            <Item>
              <YNNAPills label="FIFO / Stock Rotation Checked" value={fifoChecked} onChange={setFifoChecked} />
            </Item>
          </div>
        </section>

        {/* ── SERVICE FOLLOW-UP (rose) ─────────────────────────────────────── */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200/80 border-l-[4px] border-l-rose-500 overflow-hidden">
          <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600 text-[18px]">sync_problem</span>
              <span className="text-[0.875rem] font-bold text-slate-800 tracking-tight uppercase">Service Follow-up</span>
            </div>
            <span className="text-[10.5px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">3 Items</span>
          </div>
          <div className="p-3.5 space-y-3.5">
            <Item first>
              <YNNAPills
                label="Previous Complaint Follow-up"
                value={complaintFollowUp}
                onChange={setComplaintFollowUp}
                options={['Done', 'Pending', 'No Complaint']}
              />
            </Item>
            <Item>
              <YNNAPills
                label="Previous Delivery Follow-up"
                value={deliveryFollowUp}
                onChange={setDeliveryFollowUp}
                options={['Done', 'Pending', 'N/A']}
              />
            </Item>
            <Item>
              <YNNAPills
                label="Short / Missed Delivery Follow-up"
                value={shortDelivery}
                onChange={setShortDelivery}
                options={['Done', 'Pending', 'N/A']}
              />
            </Item>
          </div>
        </section>

        {/* ── CALL CLOSURE (teal) ──────────────────────────────────────────── */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200/80 border-l-[4px] border-l-teal-600 overflow-hidden">
          <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600 text-[18px]">handshake</span>
              <span className="text-[0.875rem] font-bold text-slate-800 tracking-tight uppercase">Call Closure</span>
            </div>
            <span className="text-[10.5px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">2 Items</span>
          </div>
          <div className="p-3.5 space-y-3.5">
            <Item first>
              <YNNAPills label="Order / Requirement Clearly Confirmed" value={orderConfirmed} onChange={setOrderConfirmed} />
            </Item>
            <Item>
              <YNNAPills label="Next Action Agreed with Customer" value={nextActionAgreed} onChange={setNextActionAgreed} />
            </Item>
          </div>
        </section>

        {/* ── MANAGER COACHING (purple) ────────────────────────────────────── */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200/80 border-l-[4px] border-l-purple-600 overflow-hidden">
          <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-600 text-[18px]">psychology</span>
              <span className="text-[0.875rem] font-bold text-slate-800 tracking-tight uppercase">Manager Coaching</span>
            </div>
            <span className="text-[10.5px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">Field Dev</span>
          </div>
          <div className="p-3.5 space-y-3.5">
            {/* Coaching Required toggle */}
            <div className="flex items-center justify-between bg-purple-50/50 p-2.5 rounded-lg border border-purple-100">
              <div>
                <span className="text-[13px] font-bold text-slate-800 block">Coaching Required?</span>
                <span className="text-[11px] text-slate-500">Provide on-field guidance or debrief</span>
              </div>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white">
                {['Yes', 'No'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setCoachingRequired(coachingRequired === opt ? '' : opt)}
                    className={
                      'pill-btn px-3 py-1 text-[12px] rounded-md transition-all ' +
                      (coachingRequired === opt
                        ? 'bg-purple-700 text-white font-bold shadow-sm'
                        : 'text-slate-600 font-semibold hover:bg-slate-50')
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Coaching Area multi-select */}
            <MultiChips
              label="Coaching Area (Multi-Select)"
              options={['Product Knowledge', 'Sales Pitch', 'Merchandising', 'Stock Rotation', 'Customer Rel.', 'Other']}
              selected={coachingArea}
              onChange={setCoachingArea}
              accentClass="bg-purple-100 text-purple-950 border border-purple-300"
              iconClass="text-purple-700"
              countClass="text-purple-700"
            />
          </div>
        </section>

        {/* ── MANAGER ACTION (slate) ───────────────────────────────────────── */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200/80 border-l-[4px] border-l-slate-600 overflow-hidden">
          <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-600 text-[18px]">task_alt</span>
              <span className="text-[0.875rem] font-bold text-slate-800 tracking-tight uppercase">Manager Action</span>
            </div>
            <span className="text-[10.5px] font-medium text-slate-500">Next Steps</span>
          </div>
          <div className="p-3.5 space-y-3.5">
            <MultiChips
              label="Next Step for This Shop"
              options={['Re-visit', 'Monitor', 'Escalate', 'Reassign', 'Commend', 'Other']}
              selected={nextStep}
              onChange={setNextStep}
              accentClass="bg-slate-200 text-slate-900 border border-slate-400"
              iconClass="text-slate-700"
              countClass="text-slate-600"
            />
          </div>
        </section>

        {/* ── MANAGER OBSERVATION (slate) ──────────────────────────────────── */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200/80 border-l-[4px] border-l-slate-500 overflow-hidden">
          <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-600 text-[18px]">edit_note</span>
              <span className="text-[0.875rem] font-bold text-slate-800 tracking-tight uppercase">Manager Observation</span>
            </div>
            <span className="text-[10.5px] font-medium text-slate-500">Field Notes</span>
          </div>
          <div className="p-3.5 space-y-2">
            <label className="block text-[12px] font-semibold text-slate-700">Short Observation / Coaching Notes</label>
            <textarea
              rows={3}
              placeholder="Write your observation… (min. 20 characters)"
              value={observation}
              onChange={(e) => {
                setObservation(e.target.value)
                setObsChars(e.target.value.length)
              }}
              className="w-full min-h-[72px] p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm resize-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition text-slate-800 placeholder:text-slate-400"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-400 pt-0.5">
              <span>Minimum 20 characters required</span>
              <span className={obsChars >= 20 ? 'text-emerald-600 font-semibold' : ''}>{obsChars} chars entered</span>
            </div>
          </div>
        </section>

        {/* ── AUDIT SUMMARY BADGE ──────────────────────────────────────────── */}
        <div className="bg-blue-50/70 rounded-xl p-3 border border-blue-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-700 text-[20px]">shield_person</span>
            <div>
              <span className="text-[12px] font-bold text-blue-900 block">S.O. Sign-off Ready</span>
              <span className="text-[11px] text-blue-700">{completedCount} / {totalCount} sections reviewed</span>
            </div>
          </div>
          <span className={`font-bold text-[11px] px-2.5 py-1 rounded-md shadow-sm ${completedCount >= totalCount ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-500'}`}>
            {completedCount >= totalCount ? 'VERIFIED' : 'PENDING'}
          </span>
        </div>

      </main>

      {/* ── STICKY BOTTOM BAR ───────────────────────────────────────────────── */}
      <div className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="h-[46px] px-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-[13px] flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[19px]">bookmark_border</span>
            <span>Draft</span>
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 h-[46px] rounded-xl bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold text-[14px] shadow-md shadow-blue-700/20 flex items-center justify-center gap-2 transition disabled:opacity-70"
          >
            <span className="material-symbols-outlined text-[19px]">check_circle</span>
            <span>{saving ? 'Saving…' : 'Submit Assessment'}</span>
          </button>
        </div>
      </div>

      {/* Material Symbols font + pill-btn styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
          font-family: 'Material Symbols Outlined';
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .pill-btn { -webkit-tap-highlight-color: transparent; }
        .pill-btn:active { transform: scale(0.95); }
      `}</style>
    </div>
  )
}

// ─── Suspense wrapper (required for useSearchParams) ─────────────────────────
export default function SalesOfficerAssessment() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-slate-500 font-sans">Loading…</div>}>
      <SalesOfficerAssessmentForm />
    </Suspense>
  )
}
