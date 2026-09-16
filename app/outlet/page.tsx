'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { OutletAssets } from '@/lib/types'

function OutletDetailInner() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || ''
  const router = useRouter()
  const [outletName, setOutletName] = useState('')
  const [assets, setAssets] = useState<OutletAssets>({ outlet_id: id, stand: false, countertop: false, wall_hanging_basket: false, other: false })
  const [toast, setToast] = useState('')

  useEffect(() => { if (id) load() }, [id])

  async function load() {
    const { data: outlet } = await supabase.from('outlets').select('name').eq('id', id).single()
    if (outlet) setOutletName(outlet.name)
    const { data: assetRow } = await supabase.from('outlet_assets').select('*').eq('outlet_id', id).maybeSingle()
    if (assetRow) setAssets(assetRow)
  }

  async function toggleAsset(key: keyof OutletAssets) {
    const updated = { ...assets, [key]: !assets[key] }
    setAssets(updated)
    const { error } = await supabase.from('outlet_assets').upsert({ ...updated, outlet_id: id })
    if (error) setToast('Failed to save asset')
  }

  if (!id) return <div className="p-6 text-center">No outlet selected</div>

  return (
    <div className="p-4 max-w-md mx-auto">
      <button onClick={() => router.back()} className="text-blue-600 font-semibold mb-3">← Back</button>
      <h1 className="text-xl font-bold mb-4">{outletName}</h1>
      {toast && <div className="bg-yellow-100 text-yellow-800 text-sm p-2 rounded-lg mb-3">{toast}</div>}

      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="font-bold mb-2">Display Assets</h2>
        {([['stand','Stand'],['countertop','Countertop'],['wall_hanging_basket','Wall Hanging Basket'],['other','Other']] as const).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 py-1">
            <input type="checkbox" className="w-5 h-5" checked={assets[key]} onChange={() => toggleAsset(key)} />
            {label}
          </label>
        ))}
      </section>
    </div>
  )
}

export default function OutletDetail() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <OutletDetailInner />
    </Suspense>
  )
}
