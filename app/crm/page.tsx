'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// ────────────────────────────────────────────────────────
// Reusable pill chip group (single-select)
// ────────────────────────────────────────────────────────
function PillGroup({
  options,
  value,
  onChange,
  wrap = true,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
  wrap?: boolean
}) {
  return (
    <div className={wrap ? 'flex flex-wrap gap-1.5' : 'flex gap-1.5 overflow-x-auto pb-1 no-scrollbar'}>
      {options.map((o) => {
        const active = value === o
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(active ? '' : o)}
            className={
              wrap
                ? active
                  ? 'shrink-0 px-2.5 py-1 text-xs rounded-full font-bold bg-blue-700 text-white shadow-sm transition'
                  : 'shrink-0 px-2.5 py-1 text-xs rounded-full font-semibold bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 transition'
                : active
                ? 'shrink-0 px-3 py-1 text-xs rounded-full font-bold bg-blue-700 text-white shadow-sm flex items-center gap-1 transition'
                : 'shrink-0 px-3 py-1 text-xs rounded-full font-medium bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 transition'
            }
          >
            {!wrap && active && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {o}
          </button>
        )
      })}
    </div>
  )
}

// ────────────────────────────────────────────────────────
// Reusable multi-select checkbox grid
// ────────────────────────────────────────────────────────
function CheckboxGrid({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string[]
  onChange: (v: string[]) => void
}) {
  const toggle = (o: string) => {
    if (value.includes(o)) onChange(value.filter((x) => x !== o))
    else onChange([...value, o])
  }
  return (
    <div className="grid grid-cols-2 gap-1.5 text-xs">
      {options.map((o) => {
        const checked = value.includes(o)
        return (
          <label
            key={o}
            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${
              checked
                ? 'border-blue-300 bg-blue-50/60'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              checked={checked}
              onChange={() => toggle(o)}
            />
            <span className={`text-[11px] ${checked ? 'font-bold text-slate-800' : 'text-slate-700'}`}>{o}</span>
          </label>
        )
      })}
    </div>
  )
}

// ────────────────────────────────────────────────────────
// Card section header
// ────────────────────────────────────────────────────────
function SectionHeader({ title, badge }: { title: string; badge?: string }) {
  return (
    <div className="bg-[#f1f5f9] px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
      <h3 className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">{title}</h3>
      {badge && <span className="text-[10px] text-slate-400 font-semibold">{badge}</span>}
    </div>
  )
}

// ────────────────────────────────────────────────────────
// Active sub-form card header (blue)
// ────────────────────────────────────────────────────────
function ActiveHeader({ title }: { title: string }) {
  return (
    <div className="bg-blue-50 px-3.5 py-2 border-b border-blue-200 flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
        <h3 className="text-[11px] font-extrabold text-blue-900 uppercase tracking-wider">{title}</h3>
      </div>
      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Active Sub-form</span>
    </div>
  )
}

// ────────────────────────────────────────────────────────
// Field label
// ────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1.5">
      {children}
    </label>
  )
}

// ────────────────────────────────────────────────────────
// Priority grid (3 color-coded options)
// ────────────────────────────────────────────────────────
const PRIORITY_STYLES: Record<string, string> = {
  Routine: 'border-slate-300 bg-white text-slate-600',
  Important: 'border-amber-500 bg-amber-500 text-white',
  Urgent: 'border-red-400 bg-red-500 text-white',
}
function PriorityChips({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {(['Routine', 'Important', 'Urgent'] as const).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`py-1 text-xs rounded-lg font-bold border transition ${
            value === p ? PRIORITY_STYLES[p] : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  )
}

// ────────────────────────────────────────────────────────
// Status grid (4 options)
// ────────────────────────────────────────────────────────
const STATUS_OPTIONS = ['Open', 'In Progress', 'Resolved', 'Closed']
const STATUS_LABELS: Record<string, string> = {
  'Open': 'Open',
  'In Progress': 'In Prog.',
  'Resolved': 'Resolved',
  'Closed': 'Closed',
}
function StatusChips({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-4 gap-1">
      {STATUS_OPTIONS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={`py-1 text-[11px] rounded-lg font-bold border transition ${
            value === s
              ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {STATUS_LABELS[s]}
        </button>
      ))}
    </div>
  )
}

// ────────────────────────────────────────────────────────
// Inline select (for Assign To, etc.)
// ────────────────────────────────────────────────────────
function InlineSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 h-10 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white appearance-none"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────
// Main form
// ────────────────────────────────────────────────────────
function CRMForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const outletCode = searchParams.get('id') || ''
  const outletName = searchParams.get('name') || 'Outlet'

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState<{
    crmType: string
    mainCategory: string
    subCategory: string
    stockCondition: string
    productSku: string
    approxQuantity: string
    requiredAction: string
    displayToolRequired: string[]
    requirementType: string
    spaceAvailable: string
    brandingLocation: string
    brandingRequired: string[]
    activityRequired: string[]
    suggestedTiming: string
    promotionRequired: string[]
    suggestedProductSku: string
    suggestedMechanic: string
    agreementRequired: string
    supportType: string
    approxValue: string
    photoUrl: string
    managerObservation: string
    recommendedAction: string
    priority: string
    assignEscalateTo: string
    followUpRequired: boolean
    expectedActionDate: string
    status: string
  }>({
    crmType: '',
    mainCategory: '',
    subCategory: '',
    stockCondition: '',
    productSku: '',
    approxQuantity: '',
    requiredAction: '',
    displayToolRequired: [],
    requirementType: '',
    spaceAvailable: '',
    brandingLocation: '',
    brandingRequired: [],
    activityRequired: [],
    suggestedTiming: '',
    promotionRequired: [],
    suggestedProductSku: '',
    suggestedMechanic: '',
    agreementRequired: '',
    supportType: '',
    approxValue: '',
    photoUrl: '',
    managerObservation: '',
    recommendedAction: '',
    priority: 'Routine',
    assignEscalateTo: '',
    followUpRequired: false,
    expectedActionDate: '',
    status: 'Open',
  })

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit() {
    if (!form.crmType || !form.mainCategory) {
      setError('CRM Type and Main Category are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const payload = {
        outlet_code: outletCode,
        ...form,
        user_id: session?.user?.id || 'offline',
        created_at: new Date().toISOString(),
      }

      const lsKey = `crm_${new Date().toISOString().split('T')[0]}`
      const existing = JSON.parse(localStorage.getItem(lsKey) || '[]')
      existing.push(payload)
      localStorage.setItem(lsKey, JSON.stringify(existing))

      if (session) {
        await supabase.from('crm_cases').insert(payload)
      }

      setSuccess(true)
      setTimeout(() => router.push('/'), 2000)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save CRM case'
      setError(msg)
    }
    setSaving(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0f294a] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Case Created</h2>
        <p className="text-blue-200 text-sm">CRM workflow saved successfully.</p>
      </div>
    )
  }

  const M = form.mainCategory

  const MAIN_CATEGORIES = [
    'Stock Issue',
    'Display Requirement',
    'Branding Requirement',
    'Marketing Activity',
    'Consumer Promotion',
    'Trade Support',
    'Other',
  ]

  return (
    <div className="min-h-[100dvh] bg-[#f8fafc] flex flex-col font-sans">
      {/* ── Sticky Navy Header ── */}
      <header className="bg-[#0f294a] text-white px-4 py-3 flex items-center gap-3 shadow-md sticky top-0 z-20 shrink-0">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 transition"
          aria-label="Back"
        >
          <svg className="w-5 h-5 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold tracking-tight text-white leading-tight">CRM &amp; Case Management</h1>
          <p className="text-[11px] text-blue-200 truncate font-medium">
            {outletName}
            {outletCode ? ` · ${outletCode}` : ''}
          </p>
        </div>
        <span className="bg-amber-400 text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
          New
        </span>
      </header>

      {/* ── Scrollable Body ── */}
      <main className="flex-1 overflow-y-auto p-3 space-y-3.5 pb-24 no-scrollbar">
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        {/* ── 1. Case Details ── */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <SectionHeader title="1. Case Details" badge="Mandatory" />
          <div className="p-3.5 space-y-3">
            {/* CRM Type */}
            <div>
              <FieldLabel>CRM Type</FieldLabel>
              <PillGroup
                options={['Complaint', 'Request', 'Query', 'Feedback', 'Opportunity']}
                value={form.crmType}
                onChange={(v) => set('crmType', v)}
              />
            </div>

            {/* Main Category — horizontal scroll */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                  Main Category
                </label>
                <span className="text-[10px] text-blue-600 font-medium">Scroll →</span>
              </div>
              <PillGroup
                options={MAIN_CATEGORIES}
                value={form.mainCategory}
                onChange={(v) => set('mainCategory', v)}
                wrap={false}
              />
            </div>
          </div>
        </section>

        {/* ── 2. Stock Issue ── */}
        {M === 'Stock Issue' && (
          <section className="bg-white rounded-xl shadow-sm border-2 border-blue-500/80 overflow-hidden ring-2 ring-blue-500/10">
            <ActiveHeader title="2. Stock Issue Specification" />
            <div className="p-3.5 space-y-3">
              {/* Stock Condition */}
              <div>
                <FieldLabel>Stock Condition</FieldLabel>
                <PillGroup
                  options={['Expired', 'Near Expiry', 'Damaged', 'Slow Moving', 'Long Unsold']}
                  value={form.stockCondition}
                  onChange={(v) => set('stockCondition', v)}
                />
              </div>

              {/* Product / SKU + Qty grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Product / SKU
                  </label>
                  <input
                    type="text"
                    placeholder="SKU or product name"
                    value={form.productSku}
                    onChange={(e) => set('productSku', e.target.value)}
                    className="in"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Approx Qty
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0"
                      value={form.approxQuantity}
                      onChange={(e) => set('approxQuantity', e.target.value)}
                      className="in text-center font-mono pr-6"
                    />
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 uppercase font-bold pointer-events-none">
                      Pcs
                    </span>
                  </div>
                </div>
              </div>

              {/* Required Action */}
              <div>
                <FieldLabel>Required Action</FieldLabel>
                <PillGroup
                  options={['Replace', 'Rotate', 'Shuffle', 'Return', 'Discount Support', 'Monitor']}
                  value={form.requiredAction}
                  onChange={(v) => set('requiredAction', v)}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 3. Display Requirement ── */}
        {M === 'Display Requirement' && (
          <section className="bg-white rounded-xl shadow-sm border-2 border-blue-500/80 overflow-hidden ring-2 ring-blue-500/10">
            <ActiveHeader title="3. Display Requirement" />
            <div className="p-3.5 space-y-3.5">
              {/* Display Tool Required */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <FieldLabel>Display Tool Required</FieldLabel>
                  <span className="text-[10px] text-slate-500 font-mono -mt-1.5">
                    Multi-select ({form.displayToolRequired.length})
                  </span>
                </div>
                <CheckboxGrid
                  options={['Floor Stand', 'Hanger', 'Wall Unit', 'Countertop', 'Wire Basket', 'Custom OCD', 'Primary Fixture', 'Other']}
                  value={form.displayToolRequired}
                  onChange={(v) => set('displayToolRequired', v)}
                />
              </div>

              {/* Requirement Type */}
              <div>
                <FieldLabel>Requirement Type</FieldLabel>
                <PillGroup
                  options={['New Placement', 'Replacement', 'Repair', 'Additional Unit']}
                  value={form.requirementType}
                  onChange={(v) => set('requirementType', v)}
                />
              </div>

              {/* Space Available */}
              <div>
                <FieldLabel>Space Available in Shop</FieldLabel>
                <PillGroup
                  options={['Yes', 'No', 'To Be Negotiated']}
                  value={form.spaceAvailable}
                  onChange={(v) => set('spaceAvailable', v)}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 4. Branding Requirement ── */}
        {M === 'Branding Requirement' && (
          <section className="bg-white rounded-xl shadow-sm border-2 border-blue-500/80 overflow-hidden ring-2 ring-blue-500/10">
            <ActiveHeader title="4. Branding Requirement" />
            <div className="p-3.5 space-y-3">
              {/* Branding Location */}
              <div>
                <FieldLabel>Branding Location</FieldLabel>
                <PillGroup
                  options={['In-store', 'Out-store', 'Both']}
                  value={form.brandingLocation}
                  onChange={(v) => set('brandingLocation', v)}
                />
              </div>

              {/* Branding Required */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <FieldLabel>Branding Required</FieldLabel>
                  <span className="text-[10px] text-slate-500 font-mono -mt-1.5">
                    Multi-select ({form.brandingRequired.length})
                  </span>
                </div>
                <CheckboxGrid
                  options={['Signboard', 'Vinyl Skin', 'Shelf Header', 'Shelf Talker', 'Wobbler', 'Fin', 'Bunting', 'Sticker', 'Other']}
                  value={form.brandingRequired}
                  onChange={(v) => set('brandingRequired', v)}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 5. Marketing Activity ── */}
        {M === 'Marketing Activity' && (
          <section className="bg-white rounded-xl shadow-sm border-2 border-blue-500/80 overflow-hidden ring-2 ring-blue-500/10">
            <ActiveHeader title="5. Marketing Activity" />
            <div className="p-3.5 space-y-3">
              {/* Activity Required */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <FieldLabel>Activity Required</FieldLabel>
                  <span className="text-[10px] text-slate-500 font-mono -mt-1.5">
                    Multi-select ({form.activityRequired.length})
                  </span>
                </div>
                <CheckboxGrid
                  options={['Sales Promoter', 'Brand Ambassador', 'Sampling', 'Consumer Engagement', 'Peak-Day Activation', 'Other']}
                  value={form.activityRequired}
                  onChange={(v) => set('activityRequired', v)}
                />
              </div>

              {/* Suggested Timing */}
              <div>
                <FieldLabel>Suggested Timing</FieldLabel>
                <PillGroup
                  options={['Weekend', 'Peak Days', 'Seasonal', 'Specific Date']}
                  value={form.suggestedTiming}
                  onChange={(v) => set('suggestedTiming', v)}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 6. Consumer Promotion ── */}
        {M === 'Consumer Promotion' && (
          <section className="bg-white rounded-xl shadow-sm border-2 border-blue-500/80 overflow-hidden ring-2 ring-blue-500/10">
            <ActiveHeader title="6. Consumer Promotion" />
            <div className="p-3.5 space-y-3">
              {/* Promotion Required */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <FieldLabel>Promotion Required</FieldLabel>
                  <span className="text-[10px] text-slate-500 font-mono -mt-1.5">
                    Multi-select ({form.promotionRequired.length})
                  </span>
                </div>
                <CheckboxGrid
                  options={['FOC Product Wrap', 'On-Shelf Discount', 'Free Small SKU with Large Pack', 'Bundle Offer', 'Sampling', 'Gift with Purchase', 'Other']}
                  value={form.promotionRequired}
                  onChange={(v) => set('promotionRequired', v)}
                />
              </div>

              {/* Suggested Product / SKU */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Suggested Product / SKU
                </label>
                <input
                  type="text"
                  placeholder="SKU or product name"
                  value={form.suggestedProductSku}
                  onChange={(e) => set('suggestedProductSku', e.target.value)}
                  className="in"
                />
              </div>

              {/* Suggested Mechanic */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Suggested Mechanic
                </label>
                <input
                  type="text"
                  placeholder="e.g. Buy 2 get 1 free"
                  value={form.suggestedMechanic}
                  onChange={(e) => set('suggestedMechanic', e.target.value)}
                  className="in"
                />
              </div>
            </div>
          </section>
        )}

        {/* ── 7. Trade Support ── */}
        {M === 'Trade Support' && (
          <section className="bg-white rounded-xl shadow-sm border-2 border-blue-500/80 overflow-hidden ring-2 ring-blue-500/10">
            <ActiveHeader title="7. Commercial Support" />
            <div className="p-3.5 space-y-3">
              {/* Agreement Required */}
              <div>
                <FieldLabel>Agreement Required</FieldLabel>
                <PillGroup
                  options={['Yes', 'No', 'Existing']}
                  value={form.agreementRequired}
                  onChange={(v) => set('agreementRequired', v)}
                />
              </div>

              {/* Support Type */}
              <div>
                <FieldLabel>Support Type</FieldLabel>
                <PillGroup
                  options={['Shelf Rent', 'Display Rent', 'Branding Agreement', 'JBP', 'Space Agreement', 'Other']}
                  value={form.supportType}
                  onChange={(v) => set('supportType', v)}
                />
              </div>

              {/* Approx Value */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Approx. Value (PKR)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.approxValue}
                  onChange={(e) => set('approxValue', e.target.value)}
                  className="in"
                />
              </div>
            </div>
          </section>
        )}

        {/* ── Other Category (simple note) ── */}
        {M === 'Other' && (
          <section className="bg-white rounded-xl shadow-sm border-2 border-blue-500/80 overflow-hidden ring-2 ring-blue-500/10">
            <ActiveHeader title="Other / Miscellaneous" />
            <div className="p-3.5">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe the issue or request..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                value={form.managerObservation}
                onChange={(e) => set('managerObservation', e.target.value)}
              />
            </div>
          </section>
        )}

        {/* ── 8. Manager Input & Workflow ── */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <SectionHeader title="8. Manager Input &amp; Workflow" badge="Required" />
          <div className="p-3.5 space-y-3">
            {/* Evidence Photo */}
            <div>
              <FieldLabel>Evidence Photo</FieldLabel>
              <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-3 flex flex-col items-center justify-center bg-slate-50/80 cursor-pointer transition">
                <input type="file" accept="image/*" capture="environment" className="hidden" />
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <circle cx="12" cy="13" r="3" strokeWidth={2} />
                  </svg>
                </div>
                <span className="text-xs font-bold text-blue-700">Add Evidence Photo</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Camera tap or gallery upload</span>
              </label>
            </div>

            {/* Manager Observation */}
            <div>
              <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1">
                Manager Observation
              </label>
              <textarea
                rows={2}
                placeholder="Describe batch code, expiry stamp, or reason..."
                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                value={form.managerObservation}
                onChange={(e) => set('managerObservation', e.target.value)}
              />
            </div>

            {/* Recommended Action */}
            <div>
              <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1">
                Recommended Action
              </label>
              <textarea
                rows={2}
                placeholder="Action required by warehouse or supervisor..."
                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                value={form.recommendedAction}
                onChange={(e) => set('recommendedAction', e.target.value)}
              />
            </div>

            {/* Priority */}
            <div>
              <FieldLabel>Priority</FieldLabel>
              <PriorityChips value={form.priority} onChange={(v) => set('priority', v)} />
            </div>

            {/* Assign / Escalate To */}
            <div>
              <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1">
                Assign / Escalate To
              </label>
              <InlineSelect
                value={form.assignEscalateTo}
                onChange={(v) => set('assignEscalateTo', v)}
                options={[
                  'Supply Chain & Logistics',
                  'Sales Team',
                  'Marketing',
                  'Trade Marketing',
                  'Distributor Warehouse',
                  'Quality Assurance (QA)',
                  'Executive Management',
                ]}
                placeholder="Select department..."
              />
            </div>

            {/* Follow-up + Target Date */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Follow-up
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => set('followUpRequired', !form.followUpRequired)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ease-in-out duration-200 ${
                      form.followUpRequired ? 'bg-blue-700' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition ease-in-out duration-200 ${
                        form.followUpRequired ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-bold text-slate-700">
                    {form.followUpRequired ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={form.expectedActionDate}
                  onChange={(e) => set('expectedActionDate', e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <FieldLabel>Initial Status</FieldLabel>
              <StatusChips value={form.status} onChange={(v) => set('status', v)} />
            </div>
          </div>
        </section>
      </main>

      {/* ── Sticky Bottom Bar ── */}
      <footer className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md px-4 py-3 border-t border-slate-200 shadow-lg z-30">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="w-full py-2.5 px-4 bg-[#0f294a] hover:bg-[#1a3a5c] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-70"
        >
          {saving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Submit Case
            </>
          )}
        </button>
      </footer>
    </div>
  )
}

import { Suspense } from 'react'
export default function CRM() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-slate-500 font-sans">Loading...</div>}>
      <CRMForm />
    </Suspense>
  )
}
