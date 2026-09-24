'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function CRMForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const outletCode = searchParams.get('id') || ''
  const outletName = searchParams.get('name') || 'Outlet'

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState<any>({
    crmType: '',
    mainCategory: '',
    subCategory: '',

    // Stock Issue
    stockCondition: '',
    productSku: '',
    approxQuantity: '',
    requiredAction: '',

    // Display Requirement
    displayToolRequired: [],
    requirementType: '',
    spaceAvailable: '',

    // Branding
    brandingLocation: '',
    brandingRequired: [],

    // Marketing Activity
    activityRequired: [],
    suggestedTiming: '',

    // Consumer Promotion
    promotionRequired: [],
    suggestedProductSku: '',
    suggestedMechanic: '',

    // Commercial Support
    agreementRequired: '',
    supportType: '',
    approxValue: '',

    // Evidence
    photoUrl: '',

    // Manager Input
    managerObservation: '',
    recommendedAction: '',

    // Workflow
    priority: '',
    assignEscalateTo: '',
    followUpRequired: '',
    expectedActionDate: '',
    status: 'Open'
  })

  function set(k: string, v: any) { setForm((f: any) => ({ ...f, [k]: v })) }

  const handleMulti = (k: string, val: string, checked: boolean) => {
    if (checked) {
      set(k, [...(form[k] || []), val])
    } else {
      set(k, (form[k] || []).filter((x: string) => x !== val))
    }
  }

  async function handleSubmit() {
    if (!form.crmType || !form.mainCategory) {
      setError('CRM Type and Main Category are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const payload = {
        outlet_code: outletCode,
        ...form,
        user_id: session?.user?.id || 'offline',
        created_at: new Date().toISOString()
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
    } catch (e: any) {
      setError(e.message || 'Failed to save CRM case')
    }
    setSaving(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Case Created</h2>
        <p className="text-slate-400">CRM workflow saved successfully.</p>
      </div>
    )
  }

  const M = form.mainCategory;

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col font-sans">
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 -ml-1 text-slate-300 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-lg font-bold leading-tight">CRM & Case Management</h1>
            <p className="text-xs text-slate-400">{outletName} {outletCode ? `(${outletCode})` : ''}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto pb-24">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

        {/* Case Section */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-sm rounded-t-xl">Case Details</div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">CRM Type</label>
              <select className="in" value={form.crmType} onChange={e => set('crmType', e.target.value)}>
                <option value="">Select...</option>
                <option>Complaint</option>
                <option>Request</option>
                <option>Query</option>
                <option>Feedback</option>
                <option>Opportunity</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Main Category</label>
              <select className="in" value={form.mainCategory} onChange={e => set('mainCategory', e.target.value)}>
                <option value="">Select...</option>
                <option>Stock Issue</option>
                <option>Display Requirement</option>
                <option>Branding Requirement</option>
                <option>Marketing Activity</option>
                <option>Consumer Promotion</option>
                <option>Trade Support</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Sections */}
        {M === 'Stock Issue' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-sm rounded-t-xl">Stock Issue</div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Stock Condition</label>
                <select className="in" value={form.stockCondition} onChange={e => set('stockCondition', e.target.value)}>
                  <option value="">Select...</option>
                  <option>Expired</option><option>Near Expiry</option><option>Damaged</option><option>Slow Moving</option><option>Long Unsold Saleable Stock</option>
                </select>
              </div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Product / SKU</label><input type="text" className="in" value={form.productSku} onChange={e => set('productSku', e.target.value)} /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Approx. Quantity</label><input type="number" className="in" value={form.approxQuantity} onChange={e => set('approxQuantity', e.target.value)} /></div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Required Action</label>
                <select className="in" value={form.requiredAction} onChange={e => set('requiredAction', e.target.value)}>
                  <option value="">Select...</option>
                  <option>Replace</option><option>Rotate</option><option>Shuffle</option><option>Return</option><option>Discount Support</option><option>Monitor</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {M === 'Display Requirement' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-sm rounded-t-xl">Display Requirement</div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Display Tool Required</label>
                <div className="flex flex-col gap-2">
                  {['Floor Stand','Hanger','Wall Unit','Countertop','Wire Basket','Custom OCD','Primary Fixture','Other'].map(o => (
                    <label key={o} className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 p-2 rounded-lg cursor-pointer hover:bg-slate-100">
                      <input type="checkbox" className="w-4 h-4 text-blue-600" checked={form.displayToolRequired.includes(o)} onChange={e => handleMulti('displayToolRequired', o, e.target.checked)} /> {o}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Requirement Type</label>
                <select className="in" value={form.requirementType} onChange={e => set('requirementType', e.target.value)}>
                  <option value="">Select...</option><option>New Placement</option><option>Replacement</option><option>Repair</option><option>Additional Unit</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Space Available</label>
                <select className="in" value={form.spaceAvailable} onChange={e => set('spaceAvailable', e.target.value)}>
                  <option value="">Select...</option><option>Yes</option><option>No</option><option>To Be Negotiated</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {M === 'Branding Requirement' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-sm rounded-t-xl">Branding</div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Branding Location</label>
                <select className="in" value={form.brandingLocation} onChange={e => set('brandingLocation', e.target.value)}>
                  <option value="">Select...</option><option>In-store</option><option>Out-store</option><option>Both</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Branding Required</label>
                <div className="flex flex-col gap-2">
                  {['Signboard','Vinyl Skin','Shelf Header','Shelf Talker','Wobbler','Fin','Bunting','Sticker','Other'].map(o => (
                    <label key={o} className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 p-2 rounded-lg cursor-pointer hover:bg-slate-100">
                      <input type="checkbox" className="w-4 h-4 text-blue-600" checked={form.brandingRequired.includes(o)} onChange={e => handleMulti('brandingRequired', o, e.target.checked)} /> {o}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {M === 'Marketing Activity' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-sm rounded-t-xl">Marketing Activity</div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Activity Required</label>
                <div className="flex flex-col gap-2">
                  {['Sales Promoter','Brand Ambassador','Sampling','Consumer Engagement','Peak-Day Activation','Other'].map(o => (
                    <label key={o} className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 p-2 rounded-lg cursor-pointer hover:bg-slate-100">
                      <input type="checkbox" className="w-4 h-4 text-blue-600" checked={form.activityRequired.includes(o)} onChange={e => handleMulti('activityRequired', o, e.target.checked)} /> {o}
                    </label>
                  ))}
                </div>
              </div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Suggested Timing</label><select className="in" value={form.suggestedTiming} onChange={e => set('suggestedTiming', e.target.value)}><option value="">Select...</option><option>Weekend</option><option>Peak Days</option><option>Seasonal</option><option>Specific Date</option></select></div>
            </div>
          </div>
        )}

        {M === 'Consumer Promotion' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-sm rounded-t-xl">Consumer Promotion</div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Promotion Required</label>
                <div className="flex flex-col gap-2">
                  {['FOC Product Wrap','On-Shelf Discount','Free Small SKU with Large Pack','Bundle Offer','Sampling','Gift with Purchase','Other'].map(o => (
                    <label key={o} className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 p-2 rounded-lg cursor-pointer hover:bg-slate-100">
                      <input type="checkbox" className="w-4 h-4 text-blue-600" checked={form.promotionRequired.includes(o)} onChange={e => handleMulti('promotionRequired', o, e.target.checked)} /> {o}
                    </label>
                  ))}
                </div>
              </div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Suggested Product / SKU</label><input type="text" className="in" value={form.suggestedProductSku} onChange={e => set('suggestedProductSku', e.target.value)} /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Suggested Mechanic</label><input type="text" className="in" value={form.suggestedMechanic} onChange={e => set('suggestedMechanic', e.target.value)} /></div>
            </div>
          </div>
        )}

        {M === 'Trade Support' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-sm rounded-t-xl">Commercial Support</div>
            <div className="p-4 space-y-4">
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Agreement Required</label><select className="in" value={form.agreementRequired} onChange={e => set('agreementRequired', e.target.value)}><option value="">Select...</option><option>Yes</option><option>No</option><option>Existing</option></select></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Support Type</label><select className="in" value={form.supportType} onChange={e => set('supportType', e.target.value)}><option value="">Select...</option><option>Shelf Rent</option><option>Display Rent</option><option>Branding Agreement</option><option>JBP</option><option>Space Agreement</option><option>Other</option></select></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Approx. Value (PKR)</label><input type="number" className="in" value={form.approxValue} onChange={e => set('approxValue', e.target.value)} /></div>
            </div>
          </div>
        )}

        {/* Manager Input & Workflow */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-sm rounded-t-xl">Manager Input & Workflow</div>
          <div className="p-4 space-y-4">
            <div><label className="block text-xs font-bold text-slate-600 mb-1">Evidence (Photo)</label><input type="file" accept="image/*" capture="environment" className="w-full text-sm" /></div>
            <div><label className="block text-xs font-bold text-slate-600 mb-1">Manager Observation</label><textarea className="in" value={form.managerObservation} onChange={e => set('managerObservation', e.target.value)}></textarea></div>
            <div><label className="block text-xs font-bold text-slate-600 mb-1">Recommended Action</label><textarea className="in" value={form.recommendedAction} onChange={e => set('recommendedAction', e.target.value)}></textarea></div>
            <div><label className="block text-xs font-bold text-slate-600 mb-1">Priority</label><select className="in" value={form.priority} onChange={e => set('priority', e.target.value)}><option value="">Select...</option><option>Routine</option><option>Important</option><option>Urgent</option></select></div>
            <div><label className="block text-xs font-bold text-slate-600 mb-1">Assign / Escalate To</label><select className="in" value={form.assignEscalateTo} onChange={e => set('assignEscalateTo', e.target.value)}><option value="">Select...</option><option>Sales</option><option>Marketing</option><option>Trade Marketing</option><option>Distributor</option><option>Supply Chain</option><option>QA</option><option>Management</option></select></div>
            <div><label className="block text-xs font-bold text-slate-600 mb-1">Follow-up Required</label><select className="in" value={form.followUpRequired} onChange={e => set('followUpRequired', e.target.value)}><option value="">Select...</option><option>Yes</option><option>No</option></select></div>
            <div><label className="block text-xs font-bold text-slate-600 mb-1">Expected Action Date</label><input type="date" className="in" value={form.expectedActionDate} onChange={e => set('expectedActionDate', e.target.value)} /></div>
            <div><label className="block text-xs font-bold text-slate-600 mb-1">Status</label><select className="in" value={form.status} onChange={e => set('status', e.target.value)}><option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option></select></div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={handleSubmit} 
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition disabled:opacity-70"
        >
          {saving ? 'Saving...' : 'Submit Case'}
        </button>
      </div>

      <style jsx global>{`.in { width:100%; border:1px solid #e2e8f0; border-radius:0.5rem; padding:0.625rem; font-size: 0.875rem; background-color: #f8fafc; outline: none; transition: all 0.2s; } .in:focus { background-color: white; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }`}</style>
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
