'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getPosition } from '@/lib/geo'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const TODAY = DAYS[new Date().getDay() - 1] || 'Monday'

export default function AddOutlet() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', channel: '', sub_channel: '', route_name: '',
    day: TODAY, alternate_name: '', remarks: '',
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit() {
    if (!form.name.trim()) { setError('Outlet name is required'); return }
    setSaving(true)
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const { lat, lng } = await getPosition()

      // find or create route
      let routeId: string | null = null
      if (form.route_name.trim()) {
        const { data: existing } = await supabase.from('routes')
          .select('id').eq('day', form.day).ilike('name', form.route_name.trim()).maybeSingle()
        if (existing) routeId = existing.id
        else {
          const { data: created, error: rErr } = await supabase.from('routes')
            .insert({ name: form.route_name.trim(), day: form.day, order_booker_id: session?.user.id })
            .select('id').single()
          if (rErr) throw rErr
          routeId = created.id
        }
      }

      let photoUrl: string | null = null
      if (photo) {
        const path = `${Date.now()}-${photo.name}`
        const { error: upErr } = await supabase.storage.from('outlet-photos').upload(path, photo)
        if (!upErr) photoUrl = supabase.storage.from('outlet-photos').getPublicUrl(path).data.publicUrl
      }

      const { error: insErr } = await supabase.from('outlets').insert({
        name: form.name.trim(),
        channel: form.channel || null,
        sub_channel: form.sub_channel || null,
        route_id: routeId,
        day: form.day,
        alternate_name: form.alternate_name.trim() || null,
        remarks: form.remarks || null,
        order_booker_id: session?.user.id,
        latitude: lat,
        longitude: lng,
        photo_url: photoUrl,
        is_new: true,
      })
      if (insErr) throw insErr

      router.push('/')
    } catch (e: any) {
      setError(e.message || 'Failed to save outlet')
    }
    setSaving(false)
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">+ Add Outlet</h1>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <Field label="Outlet Name *"><input className="in" value={form.name} onChange={e => set('name', e.target.value)} /></Field>
      <Field label="Channel"><input className="in" value={form.channel} onChange={e => set('channel', e.target.value)} /></Field>
      <Field label="Sub Channel"><input className="in" value={form.sub_channel} onChange={e => set('sub_channel', e.target.value)} /></Field>
      <Field label="PJP / Route"><input className="in" value={form.route_name} onChange={e => set('route_name', e.target.value)} /></Field>
      <Field label="Day">
        <select className="in" value={form.day} onChange={e => set('day', e.target.value)}>
          {DAYS.map(d => <option key={d}>{d}</option>)}
        </select>
      </Field>
      <Field label="Alternate Name"><input className="in" value={form.alternate_name} onChange={e => set('alternate_name', e.target.value)} /></Field>
      <Field label="Remarks"><textarea className="in" value={form.remarks} onChange={e => set('remarks', e.target.value)} /></Field>
      <Field label="Shop Photo (optional)">
        <input type="file" accept="image/*" capture="environment" onChange={e => setPhoto(e.target.files?.[0] || null)} />
      </Field>

      <button onClick={handleSubmit} disabled={saving}
        className="w-full bg-blue-600 text-white rounded-lg p-3 font-semibold mt-4 disabled:opacity-50">
        {saving ? 'Saving...' : 'Save Outlet'}
      </button>

      <style jsx global>{`.in { width:100%; border:1px solid #d1d5db; border-radius:0.5rem; padding:0.6rem; }`}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="mb-3"><label className="text-sm font-medium block mb-1">{label}</label>{children}</div>
}
