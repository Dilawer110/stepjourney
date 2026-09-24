'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getPosition } from '@/lib/geo'

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function genStoreCode() {
  const year = new Date().getFullYear()
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `OUT-${year}-${rand}`
}

const STEP_META = [
  { title: 'Store Identity',        icon: 'storefront',   label: '1. Store',  nextLabel: 'Next: Owner Details' },
  { title: 'Owner & Contact',       icon: 'person_pin',   label: '2. Owner',  nextLabel: 'Next: Location & Geo' },
  { title: 'Location & Geo',        icon: 'location_on',  label: '3. Geo',    nextLabel: 'Next: Tax & Financials' },
  { title: 'Tax & Financials',      icon: 'receipt_long', label: '4. Tax',    nextLabel: 'Next: Merchandising' },
  { title: 'Merchandising & Audit', icon: 'verified',     label: '5. Merch',  nextLabel: 'Register Outlet' },
]

/* ─────────────────────────────────────────────
   Small reusable UI components
───────────────────────────────────────────── */
function FieldLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <div className="flex items-center justify-between mb-1">
      <label className="block text-xs font-semibold text-slate-700">{text}</label>
      {required && (
        <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded text-[10px] font-bold">Required</span>
      )}
    </div>
  )
}

const INPUT_CLS = 'w-full h-12 px-3 rounded-lg bg-slate-100 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 border-0 transition-all'
const SELECT_CLS = 'w-full h-12 pl-3 pr-8 rounded-lg bg-slate-100 text-slate-900 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600 border-0'

function SelectField({ label, value, onChange, options, required }: {
  label: string; value: string; onChange: (v: string) => void
  options: string[]; required?: boolean
}) {
  return (
    <div>
      <FieldLabel text={label} required={required} />
      <div className="relative">
        <select className={SELECT_CLS} value={value} onChange={e => onChange(e.target.value)}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-3 text-slate-500 text-[20px]">expand_more</span>
      </div>
    </div>
  )
}

function Toggle2({ label, trueLabel, falseLabel, trueIcon, falseIcon, value, onChange }: {
  label: string; trueLabel: string; falseLabel: string
  trueIcon?: string; falseIcon?: string
  value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg gap-1">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`h-10 rounded text-sm font-semibold flex items-center justify-center gap-1 transition-all ${
            value ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-200'
          }`}
        >
          {trueIcon && <span className="material-symbols-outlined text-[18px]">{trueIcon}</span>}
          {trueLabel}
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`h-10 rounded text-sm font-semibold flex items-center justify-center gap-1 transition-all ${
            !value ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-200'
          }`}
        >
          {falseIcon && <span className="material-symbols-outlined text-[18px]">{falseIcon}</span>}
          {falseLabel}
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Section briefing card
───────────────────────────────────────────── */
function SectionCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#0f294a]/10 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[#0f294a] text-[24px]">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-[15px] font-bold text-slate-800 leading-tight">{title}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Form state type
───────────────────────────────────────────── */
type FormState = {
  storeCode: string
  companyCode: string
  storeName: string
  channelName: string
  channelType: string
  channelClassification: string
  subChannelName: string
  status: 'active' | 'inactive'
  storeInactiveDate: string
  areaType: string
  provinceName: string
  ownerName: string
  ownerContact: string
  emailAddress: string
  ownerCNIC: string
  cNICExpiry: string
  address: string
  townCode: string
  townName: string
  townCompanyCode: string
  localityCode: string
  localityName: string
  localityCompanyCode: string
  subLocalityCode: string
  subLocalityName: string
  subLocalityCompanyCode: string
  latitude: string
  longitude: string
  registered: boolean
  salexTaxFilerStatus: string
  sTRN: string
  nTN: string
  advanceTaxExemption: boolean
  withholdingTax: string
  subDistributor: string
  storeClassificationOne: string
  storeClassificationOneDate: string
  storeClassificationTwo: string
  storeClassificationTwoDate: string
  storeClassificationThree: string
  storeClassificationThreeDate: string
  storeMerchandized: boolean
  merchandizingRecruitmentDate: string
  storePerfect: boolean
  storePerfectDate: string
  iTStatus: string
  barcode: string
}

const INITIAL_FORM: FormState = {
  storeCode: genStoreCode(),
  companyCode: '',
  storeName: '',
  channelName: 'Retail',
  channelType: 'General Trade',
  channelClassification: '',
  subChannelName: 'General Store',
  status: 'active',
  storeInactiveDate: '',
  areaType: 'Urban',
  provinceName: 'Punjab',
  ownerName: '',
  ownerContact: '',
  emailAddress: '',
  ownerCNIC: '',
  cNICExpiry: '',
  address: '',
  townCode: '',
  townName: '',
  townCompanyCode: '',
  localityCode: '',
  localityName: '',
  localityCompanyCode: '',
  subLocalityCode: '',
  subLocalityName: '',
  subLocalityCompanyCode: '',
  latitude: '',
  longitude: '',
  registered: true,
  salexTaxFilerStatus: 'Filer',
  sTRN: '',
  nTN: '',
  advanceTaxExemption: false,
  withholdingTax: '',
  subDistributor: '',
  storeClassificationOne: 'Class A (Premier)',
  storeClassificationOneDate: '',
  storeClassificationTwo: 'Class B (Regular)',
  storeClassificationTwoDate: '',
  storeClassificationThree: 'Class C (Tertiary)',
  storeClassificationThreeDate: '',
  storeMerchandized: false,
  merchandizingRecruitmentDate: '',
  storePerfect: false,
  storePerfectDate: '',
  iTStatus: 'Active (EDI Synced)',
  barcode: '',
}

/* ─────────────────────────────────────────────
   Main wizard (inner, needs useSearchParams)
───────────────────────────────────────────── */
function AddOutletWizardInner() {
  const router = useRouter()
  useSearchParams() // consume for Suspense boundary

  const [step, setStep] = useState(1)
  const totalSteps = 5

  const [form, setForm] = useState<FormState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('add_outlet_draft')
      if (saved) {
        try { return { ...INITIAL_FORM, ...JSON.parse(saved) } } catch { /* ignore */ }
      }
    }
    return INITIAL_FORM
  })

  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Save draft to localStorage whenever form changes
  useEffect(() => {
    localStorage.setItem('add_outlet_draft', JSON.stringify(form))
  }, [form])

  function setF<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function captureGPS() {
    setGpsLoading(true)
    try {
      const { lat, lng } = await getPosition()
      setF('latitude', String(lat))
      setF('longitude', String(lng))
    } catch {
      alert('Could not get GPS location. Please ensure location services are enabled.')
    }
    setGpsLoading(false)
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null
    setPhoto(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setPhotoPreview(url)
    } else {
      setPhotoPreview(null)
    }
  }

  async function handleSubmit() {
    if (!form.storeName?.trim()) { setError('Store Name is required'); return }
    if (!form.ownerName?.trim()) { setError('Owner Name is required (Step 2)'); return }
    if (!form.ownerContact?.trim()) { setError('Owner Contact is required (Step 2)'); return }
    setSaving(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()

      let photoUrl: string | null = null
      if (photo) {
        const path = `${Date.now()}-${photo.name}`
        const { error: upErr } = await supabase.storage.from('outlet-photos').upload(path, photo)
        if (!upErr) photoUrl = supabase.storage.from('outlet-photos').getPublicUrl(path).data.publicUrl
      }

      const payload = {
        store_code: form.storeCode,
        company_store_code: form.companyCode,
        store_name: form.storeName,
        channel_name: form.channelName,
        channel_type: form.channelType,
        channel_classification: form.channelClassification,
        sub_channel_name: form.subChannelName,
        status: form.status,
        store_inactive_date: form.storeInactiveDate || null,
        area_type: form.areaType,
        province_name: form.provinceName,
        owner_name: form.ownerName,
        owner_contact: form.ownerContact,
        email_address: form.emailAddress,
        owner_cnic: form.ownerCNIC,
        cnic_expiry: form.cNICExpiry || null,
        address: form.address,
        town_code: form.townCode,
        town_name: form.townName,
        town_company_code: form.townCompanyCode,
        locality_code: form.localityCode,
        locality_name: form.localityName,
        locality_company_code: form.localityCompanyCode,
        sub_locality_code: form.subLocalityCode,
        sub_locality_name: form.subLocalityName,
        sub_locality_company_code: form.subLocalityCompanyCode,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        registered: form.registered,
        sales_tax_filer_status: form.salexTaxFilerStatus,
        strn: form.sTRN,
        ntn: form.nTN,
        advance_tax_exemption: form.advanceTaxExemption,
        withholding_tax: form.withholdingTax ? parseFloat(form.withholdingTax) : null,
        sub_distributor: form.subDistributor,
        store_classification_one: form.storeClassificationOne,
        store_classification_one_date: form.storeClassificationOneDate || null,
        store_classification_two: form.storeClassificationTwo,
        store_classification_two_date: form.storeClassificationTwoDate || null,
        store_classification_three: form.storeClassificationThree,
        store_classification_three_date: form.storeClassificationThreeDate || null,
        store_merchandized: form.storeMerchandized,
        merchandizing_recruitment_date: form.merchandizingRecruitmentDate || null,
        store_perfect: form.storePerfect,
        store_perfect_date: form.storePerfectDate || null,
        it_status: form.iTStatus,
        barcode: form.barcode,
        photo_url: photoUrl,
        user_id: session?.user?.id || 'offline',
        created_at: new Date().toISOString(),
      }

      // Offline-first: always save to localStorage
      const lsKey = `new_outlets_${new Date().toISOString().split('T')[0]}`
      const existing = JSON.parse(localStorage.getItem(lsKey) || '[]')
      existing.push(payload)
      localStorage.setItem(lsKey, JSON.stringify(existing))

      // Try syncing if online
      if (session) {
        await supabase.from('new_outlets').insert(payload)
      }

      // Clear draft
      localStorage.removeItem('add_outlet_draft')
      setSuccess(true)
      setTimeout(() => router.push('/'), 2500)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save outlet'
      setError(msg)
    }
    setSaving(false)
  }

  const pct = Math.round((step / totalSteps) * 100)
  const stepMeta = STEP_META[step - 1]

  /* ── Success Screen ── */
  if (success) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl flex flex-col items-center text-center">
          <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-200 animate-ping" />
            <div className="relative w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-[36px]">done_all</span>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full mb-2">Registration Complete</span>
          <h3 className="text-xl font-bold text-slate-800 mb-1">Outlet Registered!</h3>
          <p className="text-sm text-slate-500 mb-6">The outlet has been added to your van route inventory.</p>
          <div className="w-full bg-slate-50 rounded-xl p-4 mb-4 flex flex-col gap-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Store Code</span>
              <span className="text-xs font-mono font-bold text-slate-800">{form.storeCode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Store Name</span>
              <span className="text-xs font-semibold text-slate-800">{form.storeName}</span>
            </div>
          </div>
          <button onClick={() => router.push('/')} className="w-full h-12 rounded-lg bg-[#0f294a] text-white text-sm font-bold flex items-center justify-center gap-2">
            <span>Return to Coverage</span>
            <span className="material-symbols-outlined text-[18px]">route</span>
          </button>
        </div>
      </div>
    )
  }

  /* ── Main Wizard ── */
  return (
    <div className="min-h-[100dvh] bg-[#f8f9ff] flex flex-col font-sans">

      {/* ── Fixed Header ── */}
      <header className="fixed top-0 w-full z-50 bg-[#0f294a] text-white shadow-md">
        <div className="px-4 pt-3 pb-0 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            {/* Left: back + title */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Go Back"
                onClick={() => router.back()}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors"
              >
                <span className="material-symbols-outlined text-[24px]">arrow_back</span>
              </button>
              <div className="flex flex-col">
                <h1 className="text-[15px] font-bold leading-tight">
                  {stepMeta.title} — Step {step}
                </h1>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-blue-300 text-[13px]">local_shipping</span>
                  <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">Add New Outlet</span>
                </div>
              </div>
            </div>
            {/* Right: step pill + icon */}
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-0.5 rounded-full bg-white/15 flex items-center justify-center">
                <span className="text-[11px] font-bold text-white">Step {step} of {totalSteps}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#00142f] flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-white text-[18px]">{stepMeta.icon}</span>
              </div>
            </div>
          </div>
          {/* Header progress bar */}
          <div className="w-full pb-2">
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-300 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col w-full px-4 pt-[88px] pb-28 bg-[#f8f9ff]">
        <div className="flex flex-col w-full gap-4">

          {/* Error banner */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              {error}
            </div>
          )}

          {/* ── Step Navigator Card ── */}
          <div className="bg-white rounded-xl p-3 shadow-sm">
            {/* Step label + title + pct badge */}
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-1.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-[#455f88]" />
                <span className="text-[13px] font-bold text-[#0f294a]">Step {step} of {totalSteps}</span>
                <span className="text-slate-400 text-xs">—</span>
                <span className="text-[13px] font-semibold text-[#455f88]">{stepMeta.title}</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{pct}% Complete</span>
            </div>
            {/* Navigator progress bar */}
            <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden mb-3">
              <div
                className="bg-[#0f294a] h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            {/* 5 tab buttons */}
            <div className="grid grid-cols-5 gap-1">
              {STEP_META.map((s, idx) => {
                const tabStep = idx + 1
                const isActive = tabStep === step
                const isDone = tabStep < step
                return (
                  <button
                    key={tabStep}
                    type="button"
                    onClick={() => setStep(tabStep)}
                    className={`py-1.5 px-1 rounded-lg flex flex-col items-center justify-center transition-all ${
                      isActive
                        ? 'bg-[#0f294a] text-white'
                        : isDone
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                    <span className="text-[10px] tracking-tight truncate w-full text-center font-bold">{s.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ════════════════════════════════════
              STEP 1 — STORE DETAILS
          ════════════════════════════════════ */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <SectionCard
                icon="storefront"
                title="Store Identity & Channel"
                desc="Core identification parameters for FMCG van route allocation."
              />

              <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-4">
                {/* Store Code (auto) + Company Code */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel text="Store Code" />
                    <div className="w-full h-12 px-3 rounded-lg bg-slate-100 flex items-center justify-between">
                      <span className="text-sm font-mono font-bold text-slate-700 truncate">{form.storeCode}</span>
                      <span className="text-[10px] uppercase bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold ml-1 shrink-0">Auto</span>
                    </div>
                  </div>
                  <div>
                    <FieldLabel text="Company Code" />
                    <input
                      type="text"
                      className={INPUT_CLS}
                      placeholder="e.g. CMP-001"
                      value={form.companyCode}
                      onChange={e => setF('companyCode', e.target.value)}
                    />
                  </div>
                </div>

                {/* Store Name */}
                <div>
                  <FieldLabel text="Registered Store Name" required />
                  <div className="relative">
                    <input
                      type="text"
                      className={`${INPUT_CLS} pr-10`}
                      placeholder="Enter full shop signage name"
                      value={form.storeName}
                      onChange={e => setF('storeName', e.target.value)}
                    />
                    <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 text-[20px]">store</span>
                  </div>
                </div>

                {/* Channel Name + Channel Type */}
                <div className="grid grid-cols-2 gap-3">
                  <SelectField
                    label="Channel Name"
                    value={form.channelName}
                    onChange={v => setF('channelName', v)}
                    options={['Retail', 'LMT (Local Modern Trade)', 'Wholesale', 'Institution / HORECA']}
                  />
                  <SelectField
                    label="Channel Type"
                    value={form.channelType}
                    onChange={v => setF('channelType', v)}
                    options={['General Trade', 'Modern Trade']}
                  />
                </div>

                {/* Channel Classification */}
                <div>
                  <FieldLabel text="Channel Classification" />
                  <input
                    type="text"
                    className={INPUT_CLS}
                    placeholder="e.g. Tier-1 Grocer"
                    value={form.channelClassification}
                    onChange={e => setF('channelClassification', e.target.value)}
                  />
                </div>

                {/* Sub Channel */}
                <SelectField
                  label="Sub Channel Name"
                  value={form.subChannelName}
                  onChange={v => setF('subChannelName', v)}
                  options={['General Store', 'Bakery & Confectionery', 'Supermarket', 'Pan Shop', 'Pharmacy / Mart', 'Wholesaler']}
                />

                {/* Status toggle */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Operational Status</label>
                  <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg gap-1">
                    <button
                      type="button"
                      onClick={() => setF('status', 'active')}
                      className={`h-10 rounded text-sm font-semibold flex items-center justify-center gap-1 transition-all ${
                        form.status === 'active' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setF('status', 'inactive')}
                      className={`h-10 rounded text-sm font-semibold flex items-center justify-center gap-1 transition-all ${
                        form.status === 'inactive' ? 'bg-red-600 text-white' : 'text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">pause_circle</span>
                      Inactive
                    </button>
                  </div>
                </div>

                {/* Conditional inactive date */}
                {form.status === 'inactive' && (
                  <div>
                    <label className="block text-xs font-semibold text-red-600 mb-1">Store Inactive Date</label>
                    <input
                      type="date"
                      className="w-full h-12 px-3 rounded-lg bg-red-50 border border-red-200 text-slate-800 text-sm focus:outline-none"
                      value={form.storeInactiveDate}
                      onChange={e => setF('storeInactiveDate', e.target.value)}
                    />
                  </div>
                )}

                {/* Area Type + Province */}
                <div className="grid grid-cols-2 gap-3">
                  <SelectField
                    label="Area Type"
                    value={form.areaType}
                    onChange={v => setF('areaType', v)}
                    options={['Urban', 'Peri-Urban', 'Rural']}
                  />
                  <SelectField
                    label="Province"
                    value={form.provinceName}
                    onChange={v => setF('provinceName', v)}
                    options={['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad Capital', 'AJK']}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════
              STEP 2 — OWNER & CONTACT
          ════════════════════════════════════ */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <SectionCard
                icon="contact_phone"
                title="Proprietor & Billing Contact"
                desc="Accountable contact details for payment recovery & supply confirmations."
              />

              <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-4">
                {/* Owner Name */}
                <div>
                  <FieldLabel text="Sole Proprietor / Owner Name" required />
                  <div className="relative">
                    <input
                      type="text"
                      className={`${INPUT_CLS} pr-10`}
                      placeholder="Full name of owner"
                      value={form.ownerName}
                      onChange={e => setF('ownerName', e.target.value)}
                    />
                    <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 text-[20px]">badge</span>
                  </div>
                </div>

                {/* Owner Contact */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Owner Mobile / Order Line</label>
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Required</span>
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      className={`${INPUT_CLS} pr-10`}
                      placeholder="+92 300 0000000"
                      value={form.ownerContact}
                      onChange={e => setF('ownerContact', e.target.value)}
                    />
                    <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 text-[20px]">call</span>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <FieldLabel text="Business Email (Optional)" />
                  <input
                    type="email"
                    className={INPUT_CLS}
                    placeholder="owner@example.com"
                    value={form.emailAddress}
                    onChange={e => setF('emailAddress', e.target.value)}
                  />
                </div>

                {/* CNIC + Expiry */}
                <div>
                  <FieldLabel text="Owner CNIC (National ID)" />
                  <input
                    type="text"
                    className={INPUT_CLS}
                    placeholder="XXXXX-XXXXXXX-X"
                    maxLength={15}
                    value={form.ownerCNIC}
                    onChange={e => setF('ownerCNIC', e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel text="CNIC Expiry Date" />
                  <input
                    type="date"
                    className={INPUT_CLS}
                    value={form.cNICExpiry}
                    onChange={e => setF('cNICExpiry', e.target.value)}
                  />
                </div>

                {/* Address */}
                <div>
                  <FieldLabel text="Store Street Address & Landmark" />
                  <textarea
                    className="w-full p-3 rounded-lg bg-slate-100 text-slate-900 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 border-0"
                    rows={3}
                    placeholder="Shop address with nearest landmark"
                    value={form.address}
                    onChange={e => setF('address', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════
              STEP 3 — LOCATION & GEO
          ════════════════════════════════════ */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <SectionCard
                icon="share_location"
                title="Territory & Geofencing"
                desc="Administrative route division hierarchy with live GPS pin coordinates."
              />

              {/* GPS Card */}
              <div className="w-full rounded-xl bg-gradient-to-br from-[#0f294a] to-[#455f88] p-4 text-white shadow-md flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-300 text-[24px]">radar</span>
                    <span className="text-[13px] font-bold text-emerald-300 tracking-wide">High Precision Satellite</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/15 text-white">± 2.8m Calibrated</span>
                </div>
                <p className="text-[12px] text-blue-100/90">Device GPS verified lock. Pin sets the strict order-taking geofence radius.</p>

                {/* Lat / Lng display */}
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-2.5">
                    <span className="block text-[10px] text-blue-200 uppercase mb-0.5">Latitude</span>
                    <span className="text-sm font-mono font-bold text-white">
                      {form.latitude ? `${form.latitude}° N` : '—'}
                    </span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-2.5">
                    <span className="block text-[10px] text-blue-200 uppercase mb-0.5">Longitude</span>
                    <span className="text-sm font-mono font-bold text-white">
                      {form.longitude ? `${form.longitude}° E` : '—'}
                    </span>
                  </div>
                </div>

                {/* GPS button */}
                <button
                  type="button"
                  onClick={captureGPS}
                  disabled={gpsLoading}
                  className="w-full h-12 rounded-lg bg-white text-[#0f294a] text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-70"
                >
                  <span className={`material-symbols-outlined text-[20px] text-blue-600 ${gpsLoading ? 'animate-spin' : ''}`}>
                    {gpsLoading ? 'refresh' : 'my_location'}
                  </span>
                  <span>{gpsLoading ? 'Capturing GPS...' : 'Auto-Capture GPS Coordinates'}</span>
                </button>
                <span className="text-[11px] text-center text-blue-100/80">Captures current location automatically from device high-precision GPS</span>
              </div>

              {/* Route Boundary Allocation */}
              <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-4">
                <h3 className="text-[13px] font-bold text-slate-800">Route Boundary Allocation</h3>

                {/* Town row */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Town Code', k: 'townCode' as const, placeholder: 'TWN-XX' },
                    { label: 'Town Name', k: 'townName' as const, placeholder: 'Town' },
                    { label: 'Cmp Town Code', k: 'townCompanyCode' as const, placeholder: 'CMP-TWN' },
                  ].map(({ label, k, placeholder }) => (
                    <div key={k}>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">{label}</label>
                      <input
                        type="text"
                        placeholder={placeholder}
                        className="w-full h-11 px-2.5 rounded-lg bg-slate-100 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 border-0"
                        value={form[k]}
                        onChange={e => setF(k, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                {/* Locality row */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Locality Code', k: 'localityCode' as const, placeholder: 'LOC-XX' },
                    { label: 'Locality Name', k: 'localityName' as const, placeholder: 'Locality' },
                    { label: 'Cmp Loc Code', k: 'localityCompanyCode' as const, placeholder: 'CMP-LOC' },
                  ].map(({ label, k, placeholder }) => (
                    <div key={k}>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">{label}</label>
                      <input
                        type="text"
                        placeholder={placeholder}
                        className="w-full h-11 px-2.5 rounded-lg bg-slate-100 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 border-0"
                        value={form[k]}
                        onChange={e => setF(k, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                {/* Sub-Locality row */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Sub-Loc Code', k: 'subLocalityCode' as const, placeholder: 'SUBL-XX' },
                    { label: 'Sub-Loc Name', k: 'subLocalityName' as const, placeholder: 'Sub-Loc' },
                    { label: 'Cmp Sub-Loc', k: 'subLocalityCompanyCode' as const, placeholder: 'CMP-SUB' },
                  ].map(({ label, k, placeholder }) => (
                    <div key={k}>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">{label}</label>
                      <input
                        type="text"
                        placeholder={placeholder}
                        className="w-full h-11 px-2.5 rounded-lg bg-slate-100 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 border-0"
                        value={form[k]}
                        onChange={e => setF(k, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════
              STEP 4 — TAX & FINANCIALS
          ════════════════════════════════════ */}
          {step === 4 && (
            <div className="flex flex-col gap-4">
              <SectionCard
                icon="price_check"
                title="Taxation & Distributor Link"
                desc="FBR compliance status, withholding exemptions & regional distributor."
              />

              <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-4">
                {/* Tax Registration toggle */}
                <Toggle2
                  label="Tax Registration Status"
                  trueLabel="Registered"
                  falseLabel="Unregistered"
                  trueIcon="verified_user"
                  falseIcon="no_accounts"
                  value={form.registered}
                  onChange={v => setF('registered', v)}
                />

                {/* Sales Tax Filer Status */}
                <SelectField
                  label="Sales Tax Filer Classification"
                  value={form.salexTaxFilerStatus}
                  onChange={v => setF('salexTaxFilerStatus', v)}
                  options={['Filer', 'Non-Filer']}
                />

                {/* STRN (shown if registered) */}
                {form.registered && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">Sales Tax Reg. No. (STRN)</label>
                      <span className="text-[10px] font-bold bg-[#0f294a] text-blue-200 px-1.5 py-0.5 rounded">Registered State</span>
                    </div>
                    <input
                      type="text"
                      className={INPUT_CLS}
                      placeholder="XX-XX-XXXX-XXX-XX"
                      value={form.sTRN}
                      onChange={e => setF('sTRN', e.target.value)}
                    />
                  </div>
                )}

                {/* NTN */}
                <div>
                  <FieldLabel text="National Tax Number (NTN)" />
                  <input
                    type="text"
                    className={INPUT_CLS}
                    placeholder="XXXXXXX-X"
                    value={form.nTN}
                    onChange={e => setF('nTN', e.target.value)}
                  />
                </div>

                {/* Advance Tax Exemption toggle */}
                <Toggle2
                  label="Advance Tax Exemption"
                  trueLabel="Yes (Exempt)"
                  falseLabel="No (Apply WHT)"
                  value={form.advanceTaxExemption}
                  onChange={v => setF('advanceTaxExemption', v)}
                />

                {/* WHT % (shown if not exempt) */}
                {!form.advanceTaxExemption && (
                  <div>
                    <FieldLabel text="Withholding Tax (WHT %)" />
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        className={`${INPUT_CLS} pr-10`}
                        placeholder="e.g. 0.50"
                        value={form.withholdingTax}
                        onChange={e => setF('withholdingTax', e.target.value)}
                      />
                      <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 text-[20px]">percent</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Standard Section 236G/H rate for fast-moving confectionery.</p>
                  </div>
                )}

                {/* Sub Distributor */}
                <div>
                  <FieldLabel text="Associated Sub Distributor" />
                  <div className="relative">
                    <input
                      type="text"
                      className={`${INPUT_CLS} pr-10`}
                      placeholder="Search distributor name or code"
                      value={form.subDistributor}
                      onChange={e => setF('subDistributor', e.target.value)}
                    />
                    <span className="material-symbols-outlined absolute right-3 top-3 text-blue-500 text-[20px]">search</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════
              STEP 5 — MERCHANDISING & AUDIT
          ════════════════════════════════════ */}
          {step === 5 && (
            <div className="flex flex-col gap-4">
              <SectionCard
                icon="verified"
                title="Merchandising & Signage Audit"
                desc="Shelf-share classification, perfect store benchmarks & storefront photo capture."
              />

              <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-4">
                {/* Classification 1 */}
                <div className="grid grid-cols-2 gap-3">
                  <SelectField
                    label="Store Class 1"
                    value={form.storeClassificationOne}
                    onChange={v => setF('storeClassificationOne', v)}
                    options={['Class A (Premier)', 'Class B (Regular)', 'Class C (Tertiary)', 'Class D (Minimal)']}
                  />
                  <div>
                    <FieldLabel text="Audited Date 1" />
                    <input
                      type="date"
                      className="w-full h-11 px-2.5 rounded-lg bg-slate-100 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 border-0"
                      value={form.storeClassificationOneDate}
                      onChange={e => setF('storeClassificationOneDate', e.target.value)}
                    />
                  </div>
                </div>

                {/* Classification 2 */}
                <div className="grid grid-cols-2 gap-3">
                  <SelectField
                    label="Store Class 2"
                    value={form.storeClassificationTwo}
                    onChange={v => setF('storeClassificationTwo', v)}
                    options={['Class A (Premier)', 'Class B (Regular)', 'Class C (Tertiary)', 'Class D (Minimal)']}
                  />
                  <div>
                    <FieldLabel text="Audited Date 2" />
                    <input
                      type="date"
                      className="w-full h-11 px-2.5 rounded-lg bg-slate-100 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 border-0"
                      value={form.storeClassificationTwoDate}
                      onChange={e => setF('storeClassificationTwoDate', e.target.value)}
                    />
                  </div>
                </div>

                {/* Classification 3 */}
                <div className="grid grid-cols-2 gap-3">
                  <SelectField
                    label="Store Class 3"
                    value={form.storeClassificationThree}
                    onChange={v => setF('storeClassificationThree', v)}
                    options={['Class A (Premier)', 'Class B (Regular)', 'Class C (Tertiary)', 'Class D (Minimal)']}
                  />
                  <div>
                    <FieldLabel text="Audited Date 3" />
                    <input
                      type="date"
                      className="w-full h-11 px-2.5 rounded-lg bg-slate-100 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 border-0"
                      value={form.storeClassificationThreeDate}
                      onChange={e => setF('storeClassificationThreeDate', e.target.value)}
                    />
                  </div>
                </div>

                {/* Store Merchandised toggle */}
                <Toggle2
                  label="Bunny's Dedicated Merchandising Display?"
                  trueLabel="Yes"
                  falseLabel="No"
                  trueIcon="view_in_ar"
                  value={form.storeMerchandized}
                  onChange={v => setF('storeMerchandized', v)}
                />

                {/* Conditional merch recruitment date */}
                {form.storeMerchandized && (
                  <div>
                    <FieldLabel text="Rack Recruitment / Placement Date" />
                    <input
                      type="date"
                      className={INPUT_CLS}
                      value={form.merchandizingRecruitmentDate}
                      onChange={e => setF('merchandizingRecruitmentDate', e.target.value)}
                    />
                  </div>
                )}

                {/* Store Perfect toggle */}
                <Toggle2
                  label='Qualified as "Perfect Store"?'
                  trueLabel="Yes"
                  falseLabel="No"
                  trueIcon="star"
                  value={form.storePerfect}
                  onChange={v => setF('storePerfect', v)}
                />

                {/* Conditional perfect date */}
                {form.storePerfect && (
                  <div>
                    <FieldLabel text="Perfect Store Qualification Date" />
                    <input
                      type="date"
                      className={INPUT_CLS}
                      value={form.storePerfectDate}
                      onChange={e => setF('storePerfectDate', e.target.value)}
                    />
                  </div>
                )}

                {/* IT Status */}
                <SelectField
                  label="I.T / POS Connectivity Status"
                  value={form.iTStatus}
                  onChange={v => setF('iTStatus', v)}
                  options={['Active (EDI Synced)', 'Pending Field Router Installation', 'Inactive (Manual Bill Books)']}
                />

                {/* Barcode */}
                <div>
                  <FieldLabel text="Store Barcode / NFC Card Tag" />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className={`flex-1 ${INPUT_CLS}`}
                      placeholder="Scan or enter barcode"
                      value={form.barcode}
                      onChange={e => setF('barcode', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => {/* barcode scanner – future integration */}}
                      className="w-12 h-12 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center hover:bg-blue-200 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[24px]">barcode_scanner</span>
                    </button>
                  </div>
                </div>

                {/* Photo capture */}
                <div>
                  <FieldLabel text="Store Front & Signboard Photo" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  {photoPreview ? (
                    <div className="w-full rounded-xl overflow-hidden relative shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photoPreview} alt="Store front preview" className="w-full h-40 object-cover" />
                      <div className="absolute top-2 right-2 bg-[#0f294a]/80 backdrop-blur-md text-white text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                        <span className="material-symbols-outlined text-[12px] text-emerald-300">check_circle</span>
                        Geo-Tagged
                      </div>
                      <div className="flex items-center justify-between p-2 bg-slate-50">
                        <span className="text-xs font-semibold text-slate-700 truncate">{photo?.name}</span>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-red-500 font-semibold shrink-0 ml-2">Retake</button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="w-full min-h-[160px] rounded-xl bg-slate-100 p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                        <span className="material-symbols-outlined text-blue-600 text-[28px]">photo_camera</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">Tap to capture shop exterior photo</span>
                      <span className="text-[11px] text-slate-500 max-w-[240px] mt-0.5 text-center">Ensure storefront signage and display are clearly visible.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── Fixed Bottom Nav ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md p-4 shadow-[0_-4px_16px_rgba(15,41,74,0.08)]">
        <div className="max-w-md mx-auto flex items-center gap-3">
          {/* Back button */}
          <button
            type="button"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className={`h-12 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-1 transition-all bg-slate-100 text-slate-700 ${
              step === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            <span>Back</span>
          </button>

          {/* Next / Submit */}
          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep(s => Math.min(totalSteps, s + 1))}
              className="flex-1 h-12 px-4 rounded-lg text-sm font-bold bg-[#0f294a] text-white flex items-center justify-center gap-2 shadow-md hover:bg-[#1a3f6f] transition-colors"
            >
              <span>{stepMeta.nextLabel}</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 h-12 px-4 rounded-lg text-sm font-bold bg-emerald-600 text-white flex items-center justify-center gap-2 shadow-md hover:bg-emerald-700 transition-colors disabled:opacity-70"
            >
              <span className="material-symbols-outlined text-[22px]">verified</span>
              <span>{saving ? 'Registering...' : 'Register Outlet'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Export: wrapped in Suspense for useSearchParams
───────────────────────────────────────────── */
export default function AddOutletPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-[#0f294a] text-[48px]">storefront</span>
          <span className="text-sm font-semibold text-slate-500">Loading wizard…</span>
        </div>
      </div>
    }>
      <AddOutletWizardInner />
    </Suspense>
  )
}
