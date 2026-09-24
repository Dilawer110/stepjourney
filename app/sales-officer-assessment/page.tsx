'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function SalesOfficerAssessmentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const outletCode = searchParams.get('id') || ''
  const outletName = searchParams.get('name') || 'Outlet'

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState<any>({
    meetGreet: '',
    professionalOpeningOfCall: '',
    productCatalogUsed: '',
    relevantSKUsOffersExplained: '',
    properCallSequenceFollowed: '',
    basicCallProcedureComplied: '',
    customerNeedProperlyProbed: '',
    appropriateOrderSuggested: '',
    interactionRelationshipWithCustomer: '',
    customerObjectionsHandled: '',
    punctualityOfThisOutletVisit: '',
    appropriateTimeSpentAtShop: '',
    displayMerchandisingChecked: '',
    displayImprovementAttempted: '',
    productVisibilityImproved: '',
    expiredStockChecked: '',
    nearExpiryStockChecked: '',
    fIFOStockRotationChecked: '',
    previousComplaintFollowUp: '',
    previousDeliveryFollowUp: '',
    shortMissedDeliveryFollowUp: '',
    orderRequirementClearlyConfirmed: '',
    nextActionAgreedWithCustomer: '',
    coachingRequired: '',
    coachingArea: [],
    nextStepForThisShop: [],
    shortObservation: '',

  })

  function set(k: string, v: any) { setForm((f: any) => ({ ...f, [k]: v })) }

  async function handleSubmit() {
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

      // Offline First fallback
      const lsKey = `so_assessment_${new Date().toISOString().split('T')[0]}`
      const existing = JSON.parse(localStorage.getItem(lsKey) || '[]')
      existing.push(payload)
      localStorage.setItem(lsKey, JSON.stringify(existing))

      // Try syncing directly if online
      if (session) {
        await supabase.from('sales_officer_assessment').insert(payload)
      }

      setSuccess(true)
      setTimeout(() => router.push('/'), 2000)
    } catch (e: any) {
      setError(e.message || 'Failed to save assessment')
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
        <p className="text-slate-400">Sales Officer Assessment recorded.</p>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col font-sans">
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 -ml-1 text-slate-300 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-lg font-bold leading-tight">Sales Officer Assessment</h1>
            <p className="text-xs text-slate-400">{outletName} {outletCode ? `(${outletCode})` : ''}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto pb-24">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}


        <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4 overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-sm">
            Opening
          </div>
          <div className="p-4 space-y-4">

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Meet & Greet</label>

              <select 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.meetGreet}
                onChange={e => set('meetGreet', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="1">1 (Poor)</option>
                <option value="2">2 (Below Average)</option>
                <option value="3">3 (Average)</option>
                <option value="4">4 (Good)</option>
                <option value="5">5 (Excellent)</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Professional opening of call</label>

              <select 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.professionalOpeningOfCall}
                onChange={e => set('professionalOpeningOfCall', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="1">1 (Poor)</option>
                <option value="2">2 (Below Average)</option>
                <option value="3">3 (Average)</option>
                <option value="4">4 (Good)</option>
                <option value="5">5 (Excellent)</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4 overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-sm">
            Selling Process
          </div>
          <div className="p-4 space-y-4">

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Product Catalog Used</label>

              <select 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.productCatalogUsed}
                onChange={e => set('productCatalogUsed', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Relevant SKUs / Offers Explained</label>

              <select 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.relevantSKUsOffersExplained}
                onChange={e => set('relevantSKUsOffersExplained', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="1">1 (Poor)</option>
                <option value="2">2 (Below Average)</option>
                <option value="3">3 (Average)</option>
                <option value="4">4 (Good)</option>
                <option value="5">5 (Excellent)</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Proper Call Sequence Followed</label>

              <select 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.properCallSequenceFollowed}
                onChange={e => set('properCallSequenceFollowed', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="1">1 (Poor)</option>
                <option value="2">2 (Below Average)</option>
                <option value="3">3 (Average)</option>
                <option value="4">4 (Good)</option>
                <option value="5">5 (Excellent)</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Basic Call Procedure Complied</label>

              <select 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.basicCallProcedureComplied}
                onChange={e => set('basicCallProcedureComplied', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="1">1 (Poor)</option>
                <option value="2">2 (Below Average)</option>
                <option value="3">3 (Average)</option>
                <option value="4">4 (Good)</option>
                <option value="5">5 (Excellent)</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Customer Need Properly Probed</label>

              <select 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.customerNeedProperlyProbed}
                onChange={e => set('customerNeedProperlyProbed', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="1">1 (Poor)</option>
                <option value="2">2 (Below Average)</option>
                <option value="3">3 (Average)</option>
                <option value="4">4 (Good)</option>
                <option value="5">5 (Excellent)</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Appropriate Order Suggested</label>

              <select 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.appropriateOrderSuggested}
                onChange={e => set('appropriateOrderSuggested', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="1">1 (Poor)</option>
                <option value="2">2 (Below Average)</option>
                <option value="3">3 (Average)</option>
                <option value="4">4 (Good)</option>
                <option value="5">5 (Excellent)</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4 overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-sm">
            Customer Handling
          </div>
          <div className="p-4 space-y-4">

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Interaction & Relationship with Customer</label>

              <select 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.interactionRelationshipWithCustomer}
                onChange={e => set('interactionRelationshipWithCustomer', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="1">1 (Poor)</option>
                <option value="2">2 (Below Average)</option>
                <option value="3">3 (Average)</option>
                <option value="4">4 (Good)</option>
                <option value="5">5 (Excellent)</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Customer Objections Handled</label>

              <select 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.customerObjectionsHandled}
                onChange={e => set('customerObjectionsHandled', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="1">1 (Poor)</option>
                <option value="2">2 (Below Average)</option>
                <option value="3">3 (Average)</option>
                <option value="4">4 (Good)</option>
                <option value="5">5 (Excellent)</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4 overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-sm">
            Visit Execution
          </div>
          <div className="p-4 space-y-4">

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Punctuality of This Outlet Visit</label>

              <select 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.punctualityOfThisOutletVisit}
                onChange={e => set('punctualityOfThisOutletVisit', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Regular">Regular</option>
                <option value="Occasional">Occasional</option>
                <option value="Irregular">Irregular</option>
                <option value="Missed Completely">Missed Completely</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Appropriate Time Spent at Shop</label>

              <select 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.appropriateTimeSpentAtShop}
                onChange={e => set('appropriateTimeSpentAtShop', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Short">Short</option>
                <option value="Appropriate">Appropriate</option>
                <option value="Excessive">Excessive</option>
              </select>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4 overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-sm">
            Merchandising
          </div>
          <div className="p-4 space-y-4">

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Display / Merchandising Checked</label>

              <select 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.displayMerchandisingChecked}
                onChange={e => set('displayMerchandisingChecked', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Display Improvement Attempted</label>

              <select 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.displayImprovementAttempted}
                onChange={e => set('displayImprovementAttempted', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Product Visibility Improved</label>

              <select 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.productVisibilityImproved}
                onChange={e => set('productVisibilityImproved', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4 overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-sm">
            Stock Health
          </div>
          <div className="p-4 space-y-4">

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Expired Stock Checked</label>

              <select 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.expiredStockChecked}
                onChange={e => set('expiredStockChecked', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Near-Expiry Stock Checked</label>

              <select 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.nearExpiryStockChecked}
                onChange={e => set('nearExpiryStockChecked', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">FIFO / Stock Rotation Checked</label>

              <select 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.fIFOStockRotationChecked}
                onChange={e => set('fIFOStockRotationChecked', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4 overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-sm">
            Service
          </div>
          <div className="p-4 space-y-4">

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Previous Complaint Follow-up</label>

              <select 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.previousComplaintFollowUp}
                onChange={e => set('previousComplaintFollowUp', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Done">Done</option>
                <option value="Pending">Pending</option>
                <option value="No Complaint">No Complaint</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Previous Delivery Follow-up</label>

              <select 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.previousDeliveryFollowUp}
                onChange={e => set('previousDeliveryFollowUp', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Done">Done</option>
                <option value="Pending">Pending</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Short / Missed Delivery Follow-up</label>

              <select 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.shortMissedDeliveryFollowUp}
                onChange={e => set('shortMissedDeliveryFollowUp', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Done">Done</option>
                <option value="Pending">Pending</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4 overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-sm">
            Call Closure
          </div>
          <div className="p-4 space-y-4">

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Order / Requirement Clearly Confirmed</label>

              <select 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.orderRequirementClearlyConfirmed}
                onChange={e => set('orderRequirementClearlyConfirmed', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Next Action Agreed with Customer</label>

              <select 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.nextActionAgreedWithCustomer}
                onChange={e => set('nextActionAgreedWithCustomer', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4 overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-sm">
            Manager Coaching
          </div>
          <div className="p-4 space-y-4">

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Coaching Required</label>

              <select 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.coachingRequired}
                onChange={e => set('coachingRequired', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Coaching Area</label>

              <div className="flex flex-col gap-2">
                
                <label className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 p-2 rounded-lg cursor-pointer hover:bg-slate-100">
                  <input 
                    type="checkbox" 
                    checked={form.coachingArea.includes('Product Knowledge')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        set('coachingArea', [...form.coachingArea, 'Product Knowledge']);
                      } else {
                        set('coachingArea', form.coachingArea.filter((val: string) => val !== 'Product Knowledge'));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  Product Knowledge
                </label>
                
                <label className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 p-2 rounded-lg cursor-pointer hover:bg-slate-100">
                  <input 
                    type="checkbox" 
                    checked={form.coachingArea.includes('Sales Pitch')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        set('coachingArea', [...form.coachingArea, 'Sales Pitch']);
                      } else {
                        set('coachingArea', form.coachingArea.filter((val: string) => val !== 'Sales Pitch'));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  Sales Pitch
                </label>
                
                <label className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 p-2 rounded-lg cursor-pointer hover:bg-slate-100">
                  <input 
                    type="checkbox" 
                    checked={form.coachingArea.includes('Merchandising')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        set('coachingArea', [...form.coachingArea, 'Merchandising']);
                      } else {
                        set('coachingArea', form.coachingArea.filter((val: string) => val !== 'Merchandising'));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  Merchandising
                </label>
                
                <label className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 p-2 rounded-lg cursor-pointer hover:bg-slate-100">
                  <input 
                    type="checkbox" 
                    checked={form.coachingArea.includes('Stock Rotation')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        set('coachingArea', [...form.coachingArea, 'Stock Rotation']);
                      } else {
                        set('coachingArea', form.coachingArea.filter((val: string) => val !== 'Stock Rotation'));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  Stock Rotation
                </label>
                
                <label className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 p-2 rounded-lg cursor-pointer hover:bg-slate-100">
                  <input 
                    type="checkbox" 
                    checked={form.coachingArea.includes('Customer Relationship')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        set('coachingArea', [...form.coachingArea, 'Customer Relationship']);
                      } else {
                        set('coachingArea', form.coachingArea.filter((val: string) => val !== 'Customer Relationship'));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  Customer Relationship
                </label>
                
                <label className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 p-2 rounded-lg cursor-pointer hover:bg-slate-100">
                  <input 
                    type="checkbox" 
                    checked={form.coachingArea.includes('Other')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        set('coachingArea', [...form.coachingArea, 'Other']);
                      } else {
                        set('coachingArea', form.coachingArea.filter((val: string) => val !== 'Other'));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  Other
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4 overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-sm">
            Manager Action
          </div>
          <div className="p-4 space-y-4">

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Next Step for This Shop</label>

              <div className="flex flex-col gap-2">
                
                <label className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 p-2 rounded-lg cursor-pointer hover:bg-slate-100">
                  <input 
                    type="checkbox" 
                    checked={form.nextStepForThisShop.includes('Product Knowledge')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        set('nextStepForThisShop', [...form.nextStepForThisShop, 'Product Knowledge']);
                      } else {
                        set('nextStepForThisShop', form.nextStepForThisShop.filter((val: string) => val !== 'Product Knowledge'));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  Product Knowledge
                </label>
                
                <label className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 p-2 rounded-lg cursor-pointer hover:bg-slate-100">
                  <input 
                    type="checkbox" 
                    checked={form.nextStepForThisShop.includes('Sales Pitch')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        set('nextStepForThisShop', [...form.nextStepForThisShop, 'Sales Pitch']);
                      } else {
                        set('nextStepForThisShop', form.nextStepForThisShop.filter((val: string) => val !== 'Sales Pitch'));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  Sales Pitch
                </label>
                
                <label className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 p-2 rounded-lg cursor-pointer hover:bg-slate-100">
                  <input 
                    type="checkbox" 
                    checked={form.nextStepForThisShop.includes('Merchandising')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        set('nextStepForThisShop', [...form.nextStepForThisShop, 'Merchandising']);
                      } else {
                        set('nextStepForThisShop', form.nextStepForThisShop.filter((val: string) => val !== 'Merchandising'));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  Merchandising
                </label>
                
                <label className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 p-2 rounded-lg cursor-pointer hover:bg-slate-100">
                  <input 
                    type="checkbox" 
                    checked={form.nextStepForThisShop.includes('Stock Rotation')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        set('nextStepForThisShop', [...form.nextStepForThisShop, 'Stock Rotation']);
                      } else {
                        set('nextStepForThisShop', form.nextStepForThisShop.filter((val: string) => val !== 'Stock Rotation'));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  Stock Rotation
                </label>
                
                <label className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 p-2 rounded-lg cursor-pointer hover:bg-slate-100">
                  <input 
                    type="checkbox" 
                    checked={form.nextStepForThisShop.includes('Customer Relationship')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        set('nextStepForThisShop', [...form.nextStepForThisShop, 'Customer Relationship']);
                      } else {
                        set('nextStepForThisShop', form.nextStepForThisShop.filter((val: string) => val !== 'Customer Relationship'));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  Customer Relationship
                </label>
                
                <label className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 p-2 rounded-lg cursor-pointer hover:bg-slate-100">
                  <input 
                    type="checkbox" 
                    checked={form.nextStepForThisShop.includes('Other')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        set('nextStepForThisShop', [...form.nextStepForThisShop, 'Other']);
                      } else {
                        set('nextStepForThisShop', form.nextStepForThisShop.filter((val: string) => val !== 'Other'));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  Other
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4 overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-sm">
            Manager Note
          </div>
          <div className="p-4 space-y-4">

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Short Observation</label>

              <textarea 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
                value={form.shortObservation}
                onChange={e => set('shortObservation', e.target.value)}
                placeholder="Optional observation..."
              ></textarea>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={handleSubmit} 
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition disabled:opacity-70"
        >
          {saving ? 'Saving...' : 'Submit Assessment'}
        </button>
      </div>
    </div>
  )
}

import { Suspense } from 'react'

export default function SalesOfficerAssessment() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-slate-500 font-sans">Loading...</div>}>
      <SalesOfficerAssessmentForm />
    </Suspense>
  )
}
