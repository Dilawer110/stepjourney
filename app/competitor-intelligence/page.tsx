'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function CompetitorIntelligenceForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const outletCode = searchParams.get('id') || ''
  const outletName = searchParams.get('name') || 'Outlet'

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    competitorCompany: '',
    productSku: '',
    variantFlavour: '',
    packSize: '',
  })

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit() {
    setSaving(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const payload = {
        outlet_code: outletCode,
        competitor_company: form.competitorCompany,
        product_sku: form.productSku,
        variant_flavour: form.variantFlavour,
        pack_size: form.packSize,
        user_id: session?.user?.id || 'offline',
        created_at: new Date().toISOString()
      }

      // Offline First fallback
      const lsKey = `comp_intel_${new Date().toISOString().split('T')[0]}`
      const existing = JSON.parse(localStorage.getItem(lsKey) || '[]')
      existing.push(payload)
      localStorage.setItem(lsKey, JSON.stringify(existing))

      // Try syncing directly if online
      if (session) {
        await supabase.from('competitor_intelligence').insert(payload)
      }

      setSuccess(true)
      setTimeout(() => router.push('/'), 2000)
    } catch (e: any) {
      setError(e.message || 'Failed to save form')
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
        <p className="text-slate-400">Competitor data recorded.</p>
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
            <h1 className="text-lg font-bold leading-tight">Competitor Intelligence</h1>
            <p className="text-xs text-slate-400">{outletName} {outletCode ? `(${outletCode})` : ''}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto pb-24">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4 overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-sm">
            Identification
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Competitor Company / Brand</label>
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.competitorCompany}
                onChange={e => set('competitorCompany', e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Product / SKU</label>
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.productSku}
                onChange={e => set('productSku', e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Variant / Flavour</label>
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.variantFlavour}
                onChange={e => set('variantFlavour', e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4 overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-sm">
            Pack
          </div>
          <div className="p-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Pack Size / Grammage</label>
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.packSize}
                onChange={e => set('packSize', e.target.value)}
                placeholder="Optional"
              />
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
          {saving ? 'Saving...' : 'Submit Observation'}
        </button>
      </div>
    </div>
  )
}

import { Suspense } from 'react'

export default function CompetitorIntelligence() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-slate-500 font-sans">Loading...</div>}>
      <CompetitorIntelligenceForm />
    </Suspense>
  )
}
