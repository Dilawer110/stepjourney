'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getPosition } from '@/lib/geo'
import { Outlet, OutletWithStatus, VisitStatus } from '@/lib/types'
import SummaryBar from '@/components/SummaryBar'
import FilterTabs from '@/components/FilterTabs'
import OutletCard from '@/components/OutletCard'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [outlets, setOutlets] = useState<OutletWithStatus[]>([])
  const [routeName, setRouteName] = useState('')
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const today = DAYS[new Date().getDay()]
  const todayISO = new Date().toISOString().slice(0, 10)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }
    if (today === 'Sunday') { setLoading(false); return }

    try {
      const { data: outletRows, error } = await supabase
        .from('outlets').select('*, routes(name)').eq('day', today).order('name')
      if (error) throw error

      const { data: visitRows } = await supabase
        .from('outlet_visits').select('outlet_id, status').eq('visit_date', todayISO)

      const visitMap = new Map((visitRows || []).map(v => [v.outlet_id, v.status]))
      const merged: OutletWithStatus[] = (outletRows || []).map((o: any) => ({
        ...o, status: visitMap.get(o.id) || 'remaining',
      }))
      setOutlets(merged)
      setRouteName(outletRows?.[0]?.routes?.name || '')
      localStorage.setItem('todayOutlets', JSON.stringify({ merged, routeName: outletRows?.[0]?.routes?.name }))
    } catch {
      const cached = localStorage.getItem('todayOutlets')
      if (cached) {
        const { merged, routeName } = JSON.parse(cached)
        setOutlets(merged); setRouteName(routeName)
        setToast('Offline — showing cached list')
      } else setToast('Failed to load outlets. Check connection.')
    }
    setLoading(false)
  }

  async function setStatus(id: string, status: VisitStatus | 'remaining') {
    setOutlets(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    try {
      if (status === 'remaining') {
        await supabase.from('outlet_visits').delete().eq('outlet_id', id).eq('visit_date', todayISO)
      } else {
        const { lat, lng } = await getPosition()
        const { error } = await supabase.from('outlet_visits').upsert({
          outlet_id: id, order_booker_id: session.user.id, visit_date: todayISO,
          status, latitude: lat, longitude: lng, visited_at: new Date().toISOString(),
        }, { onConflict: 'outlet_id,visit_date' })
        if (error) throw error
      }
    } catch {
      setToast('Update failed — tap Retry')
      setTimeout(() => setStatus(id, status), 0)
    }
  }

  async function setAlternateName(id: string, current: string | null) {
    const name = window.prompt('Alternate Name (leave blank to remove):', current || '')
    if (name === null) return
    const value = name.trim() || null
    const { error } = await supabase.from('outlets').update({ alternate_name: value }).eq('id', id)
    if (!error) setOutlets(prev => prev.map(o => o.id === id ? { ...o, alternate_name: value } : o))
    else setToast('Failed to update alternate name')
  }

  const filtered = useMemo(() => {
    return outlets.filter(o => {
      if (search && !o.name.toLowerCase().includes(search.toLowerCase()) && !o.code?.includes(search)) return false
      if (filter === 'Remaining') return o.status === 'remaining'
      if (filter === 'Visited') return o.status === 'visited' || o.status === 'billed'
      if (filter === 'Billed') return o.status === 'billed'
      return true
    })
  }, [outlets, filter, search])

  const planned = outlets.length
  const billed = outlets.filter(o => o.status === 'billed').length
  const visited = outlets.filter(o => o.status === 'visited' || o.status === 'billed').length
  const remaining = planned - visited
  const newCount = outlets.filter(o => o.is_new).length

  if (loading) return <div className="p-6 text-center">Loading...</div>
  if (today === 'Sunday') return <div className="p-6 text-center text-xl font-bold">Sunday — Day Off 🎉</div>

  return (
    <div className="p-3 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-2">
        <SummaryBar day={today} routeName={routeName} planned={planned} visited={visited} remaining={remaining} billed={billed} newCount={newCount} />
      </div>
      <Link href="/add-outlet" className="block text-center bg-purple-600 text-white rounded-lg p-3 font-semibold mb-3">
        + Add Outlet
      </Link>
      <input className="w-full border rounded-lg p-3 mb-3" placeholder="Search outlet name or code..."
        value={search} onChange={e => setSearch(e.target.value)} />
      <FilterTabs active={filter} onChange={setFilter} />
      {toast && <div className="bg-yellow-100 text-yellow-800 text-sm p-2 rounded-lg mb-2">{toast}</div>}
      {filtered.map(o => <OutletCard key={o.id} outlet={o} onSetStatus={setStatus} onSetAlternateName={setAlternateName} />)}
      {filtered.length === 0 && <p className="text-center text-gray-400 mt-8">No outlets found</p>}
    </div>
  )
}
