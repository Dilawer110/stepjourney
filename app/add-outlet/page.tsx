'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getPosition } from '@/lib/geo'

export default function AddOutletWizard() {
  const router = useRouter()
  
  const [step, setStep] = useState(1)
  const totalSteps = 5

  const [form, setForm] = useState({
    storeCode: '',
    companyStoreCode: '',
    storeName: '',
    channelName: '',
    channelType: '',
    channelClassification: '',
    subChannelName: '',
    registered: '',
    salexTaxFilerStatus: '',
    sTRN: '',
    nTN: '',
    status: '',
    storeInactiveDate: '',
    ownerName: '',
    emailAddress: '',
    ownerCNIC: '',
    cNICExpiry: '',
    ownerContact: '',
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
    storeAddedOn: '',
    storeClassificationOne: '',
    storeClassificationOneDate: '',
    storeClassificationTwo: '',
    storeClassificationTwoDate: '',
    storeClassificationThree: '',
    storeClassificationThreeDate: '',
    storeMerchandized: '',
    merchandizingRecruitmentDate: '',
    storePerfect: '',
    storePerfectDate: '',
    subDistributor: '',
    iTStatus: '',
    advanceTaxExemption: '',
    withholdingTax: '',
    areaType: '',
    barcode: '',
    provinceName: '',

  })

  const [photo, setPhoto] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function captureLocation() {
    try {
      const { lat, lng } = await getPosition()
      set('latitude', String(lat))
      set('longitude', String(lng))
    } catch (e) {
      alert('Could not get GPS location. Please ensure location services are enabled.')
    }
  }

  async function handleSubmit() {
    if (!form.storeName?.trim()) { setError('Store Name is required'); return }
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
        ...form,
        photo_url: photoUrl,
        user_id: session?.user?.id || 'offline',
        created_at: new Date().toISOString()
      }

      // Offline First fallback
      const lsKey = `new_outlets_${new Date().toISOString().split('T')[0]}`
      const existing = JSON.parse(localStorage.getItem(lsKey) || '[]')
      existing.push(payload)
      localStorage.setItem(lsKey, JSON.stringify(existing))

      // Try syncing directly if online
      if (session) {
        await supabase.from('new_outlets').insert(payload)
      }

      setSuccess(true)
      setTimeout(() => router.push('/'), 2000)
    } catch (e: any) {
      setError(e.message || 'Failed to save outlet')
    }
    setSaving(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Saved Successfully</h2>
        <p className="text-slate-400">New outlet registration complete.</p>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col font-sans">
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1 -ml-1 text-slate-300 hover:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="text-lg font-bold leading-tight">Add New Outlet</h1>
          </div>
          <div className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded">
            Step {step} of {totalSteps}
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 mt-3 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto pb-28">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Store Details</h2>
            <Field label="Store Code">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.storeCode}
                onChange={e => set('storeCode', e.target.value)}
              />
            </Field>
            <Field label="Company Store Code">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.companyStoreCode}
                onChange={e => set('companyStoreCode', e.target.value)}
              />
            </Field>
            <Field label="Store Name">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.storeName}
                onChange={e => set('storeName', e.target.value)}
              />
            </Field>
            <Field label="Channel Name">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.channelName}
                onChange={e => set('channelName', e.target.value)}
              />
            </Field>
            <Field label="Channel Type">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.channelType}
                onChange={e => set('channelType', e.target.value)}
              />
            </Field>
            <Field label="Channel Classification">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.channelClassification}
                onChange={e => set('channelClassification', e.target.value)}
              />
            </Field>
            <Field label="Sub Channel Name">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.subChannelName}
                onChange={e => set('subChannelName', e.target.value)}
              />
            </Field>
            <Field label="Status">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.status}
                onChange={e => set('status', e.target.value)}
              />
            </Field>
            <Field label="Store Inactive Date">
              <input 
                type="date" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.storeInactiveDate}
                onChange={e => set('storeInactiveDate', e.target.value)}
              />
            </Field>
            <Field label="Store Added On">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.storeAddedOn}
                onChange={e => set('storeAddedOn', e.target.value)}
              />
            </Field>
            <Field label="Area Type">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.areaType}
                onChange={e => set('areaType', e.target.value)}
              />
            </Field>
            <Field label="Province Name">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.provinceName}
                onChange={e => set('provinceName', e.target.value)}
              />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Owner & Contact</h2>
            <Field label="Owner Name">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.ownerName}
                onChange={e => set('ownerName', e.target.value)}
              />
            </Field>
            <Field label="Email Address">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.emailAddress}
                onChange={e => set('emailAddress', e.target.value)}
              />
            </Field>
            <Field label="Owner CNIC">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.ownerCNIC}
                onChange={e => set('ownerCNIC', e.target.value)}
              />
            </Field>
            <Field label="CNIC Expiry">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.cNICExpiry}
                onChange={e => set('cNICExpiry', e.target.value)}
              />
            </Field>
            <Field label="Owner Contact">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.ownerContact}
                onChange={e => set('ownerContact', e.target.value)}
              />
            </Field>
            <Field label="Address">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.address}
                onChange={e => set('address', e.target.value)}
              />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Location & Geo</h2>
            <Field label="Town Code">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.townCode}
                onChange={e => set('townCode', e.target.value)}
              />
            </Field>
            <Field label="Town Name">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.townName}
                onChange={e => set('townName', e.target.value)}
              />
            </Field>
            <Field label="Town Company Code">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.townCompanyCode}
                onChange={e => set('townCompanyCode', e.target.value)}
              />
            </Field>
            <Field label="Locality Code">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.localityCode}
                onChange={e => set('localityCode', e.target.value)}
              />
            </Field>
            <Field label="Locality Name">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.localityName}
                onChange={e => set('localityName', e.target.value)}
              />
            </Field>
            <Field label="Locality Company Code">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.localityCompanyCode}
                onChange={e => set('localityCompanyCode', e.target.value)}
              />
            </Field>
            <Field label="Sub-Locality Code">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.subLocalityCode}
                onChange={e => set('subLocalityCode', e.target.value)}
              />
            </Field>
            <Field label="Sub-Locality Name">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.subLocalityName}
                onChange={e => set('subLocalityName', e.target.value)}
              />
            </Field>
            <Field label="Sub-Locality Company Code">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.subLocalityCompanyCode}
                onChange={e => set('subLocalityCompanyCode', e.target.value)}
              />
            </Field>
            <Field label="Latitude">
              <input 
                type="number" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.latitude}
                onChange={e => set('latitude', e.target.value)}
              />
            </Field>
            <Field label="Longitude">
              <input 
                type="number" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.longitude}
                onChange={e => set('longitude', e.target.value)}
              />
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Tax & Financials</h2>
            <Field label="Registered">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.registered}
                onChange={e => set('registered', e.target.value)}
              />
            </Field>
            <Field label="SalexTaxFilerStatus">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.salexTaxFilerStatus}
                onChange={e => set('salexTaxFilerStatus', e.target.value)}
              />
            </Field>
            <Field label="STRN">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.sTRN}
                onChange={e => set('sTRN', e.target.value)}
              />
            </Field>
            <Field label="NTN">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.nTN}
                onChange={e => set('nTN', e.target.value)}
              />
            </Field>
            <Field label="Advance Tax Exemption">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.advanceTaxExemption}
                onChange={e => set('advanceTaxExemption', e.target.value)}
              />
            </Field>
            <Field label="Withholding Tax %">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.withholdingTax}
                onChange={e => set('withholdingTax', e.target.value)}
              />
            </Field>
            <Field label="Sub Distributor">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.subDistributor}
                onChange={e => set('subDistributor', e.target.value)}
              />
            </Field>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Merchandising & Classification</h2>
            <Field label="Store Classification One">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.storeClassificationOne}
                onChange={e => set('storeClassificationOne', e.target.value)}
              />
            </Field>
            <Field label="Store Classification One Date">
              <input 
                type="date" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.storeClassificationOneDate}
                onChange={e => set('storeClassificationOneDate', e.target.value)}
              />
            </Field>
            <Field label="Store Classification Two">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.storeClassificationTwo}
                onChange={e => set('storeClassificationTwo', e.target.value)}
              />
            </Field>
            <Field label="Store Classification Two Date">
              <input 
                type="date" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.storeClassificationTwoDate}
                onChange={e => set('storeClassificationTwoDate', e.target.value)}
              />
            </Field>
            <Field label="Store Classification Three">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.storeClassificationThree}
                onChange={e => set('storeClassificationThree', e.target.value)}
              />
            </Field>
            <Field label="Store Classification Three Date">
              <input 
                type="date" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.storeClassificationThreeDate}
                onChange={e => set('storeClassificationThreeDate', e.target.value)}
              />
            </Field>
            <Field label="Store Merchandized">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.storeMerchandized}
                onChange={e => set('storeMerchandized', e.target.value)}
              />
            </Field>
            <Field label="Merchandizing Recruitment Date">
              <input 
                type="date" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.merchandizingRecruitmentDate}
                onChange={e => set('merchandizingRecruitmentDate', e.target.value)}
              />
            </Field>
            <Field label="Store Perfect">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.storePerfect}
                onChange={e => set('storePerfect', e.target.value)}
              />
            </Field>
            <Field label="Store Perfect Date">
              <input 
                type="date" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.storePerfectDate}
                onChange={e => set('storePerfectDate', e.target.value)}
              />
            </Field>
            <Field label="I.T Status">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.iTStatus}
                onChange={e => set('iTStatus', e.target.value)}
              />
            </Field>
            <Field label="Barcode">
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.barcode}
                onChange={e => set('barcode', e.target.value)}
              />
            </Field>
          </div>
        )}
          
          {step === 3 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 flex flex-col items-center justify-center">
              <button onClick={captureLocation} className="text-blue-600 font-bold text-sm flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-blue-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Auto-Capture GPS Coordinates
              </button>
              <p className="text-xs text-blue-500 mt-2 text-center">Captures current Lat/Long directly from device.</p>
            </div>
          )}

          {step === totalSteps && (
            <div className="mt-6 border-t border-slate-200 pt-4">
              <Field label="Shop Photo (optional)">
                <input type="file" accept="image/*" capture="environment" onChange={e => setPhoto(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </Field>
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex gap-3">
        {step > 1 && (
          <button 
            onClick={() => setStep(s => s - 1)}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition"
          >
            Back
          </button>
        )}
        {step < totalSteps ? (
          <button 
            onClick={() => setStep(s => s + 1)}
            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition"
          >
            Next Step
          </button>
        ) : (
          <button 
            onClick={handleSubmit} 
            disabled={saving}
            className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-md transition disabled:opacity-70"
          >
            {saving ? 'Saving...' : 'Submit Outlet'}
          </button>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="text-xs font-bold text-slate-600 block mb-1">{label}</label>
      {children}
    </div>
  )
}
