'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getPosition } from '@/lib/geo'
import { OutletWithStatus, VisitStatus } from '@/lib/types'
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
  const [userName, setUserName] = useState('User')
  
  const today = DAYS[new Date().getDay()]
  const todayISO = new Date().toISOString().slice(0, 10)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }
    setUserName(session.user.email?.split('@')[0] || 'User')

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
      if (search && !o.name.toLowerCase().includes(search.toLowerCase()) && !o.code?.toLowerCase().includes(search.toLowerCase())) return false
      if (filter === 'Remaining') return o.status === 'remaining'
      if (filter === 'Visited') return o.status === 'visited'
      if (filter === 'Billed') return o.status === 'billed'
      return true
    })
  }, [outlets, filter, search])

  const planned = outlets.length
  const billed = outlets.filter(o => o.status === 'billed').length
  const visited = outlets.filter(o => o.status === 'visited').length
  const remaining = planned - billed - visited - outlets.filter(o => !['remaining','visited','billed'].includes(o.status)).length

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-100">
      <div className="text-sm font-semibold text-slate-500 flex flex-col items-center gap-2">
        <span className="material-symbols-outlined animate-spin">refresh</span>
        Loading Outlets...
      </div>
    </div>
  )
  
  if (today === 'Sunday') return (
    <div className="flex h-screen items-center justify-center bg-slate-100 p-6 text-center text-lg font-bold text-slate-700">
      Sunday — Day Off 🎉
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-slate-100 shadow-xl relative overflow-hidden">
      
      {/* Header (Status Bar & Title) */}
      <div className="bg-[#0f294a] text-white pt-6 px-4 pb-3 select-none flex flex-col sticky top-0 z-20 shadow-md">
        <div className="flex items-center justify-between pb-1">
          <div>
            <div className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">Field Routing</div>
            <h2 className="text-lg font-bold text-white leading-tight">Today's Outlets</h2>
          </div>
          
          <div className="flex items-center gap-1.5">
            <div className="bg-blue-900/80 border border-blue-700/60 rounded-lg px-2 py-1 flex items-center gap-1.5 text-[11px] font-medium text-white shadow-sm capitalize">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {userName}
            </div>
            <div className="bg-blue-900/80 border border-blue-700/60 rounded-lg px-2 py-1 flex items-center gap-1 text-[11px] font-medium text-white shadow-sm">
              {today.slice(0, 3)}
              <span className="material-symbols-outlined text-[14px]">calendar_month</span>
            </div>
          </div>
        </div>
        {routeName && <div className="text-xs text-blue-200/70 font-medium mt-0.5">{routeName}</div>}
      </div>

      {/* Search Bar & Filters */}
      <div className="px-3 pt-3 pb-2 bg-white border-b border-slate-200 shadow-sm sticky top-[76px] z-10">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">search</span>
          <input 
            type="text" 
            placeholder="Search outlets or code..."
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner" 
          />
          <Link href="/add-outlet" className="absolute right-2.5 text-blue-500 hover:text-blue-700 transition flex items-center justify-center bg-white p-0.5 rounded-full">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
          </Link>
        </div>
        
        {/* Quick Status Filter Pills */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar pb-1 text-[11px] snap-x">
          <button 
            onClick={() => setFilter('Remaining')} 
            className={`snap-start whitespace-nowrap px-3 py-1 rounded-full font-medium border transition-colors ${filter === 'Remaining' ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
          >
            Remaining ({remaining})
          </button>
          <button 
            onClick={() => setFilter('Visited')} 
            className={`snap-start whitespace-nowrap px-3 py-1 rounded-full font-medium border transition-colors ${filter === 'Visited' ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
          >
            Visited ({visited})
          </button>
          <button 
            onClick={() => setFilter('Billed')} 
            className={`snap-start whitespace-nowrap px-3 py-1 rounded-full font-medium border transition-colors ${filter === 'Billed' ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
          >
            Billed ({billed})
          </button>
          <button 
            onClick={() => setFilter('All')} 
            className={`snap-start whitespace-nowrap px-3 py-1 rounded-full font-medium border transition-colors ${filter === 'All' ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
          >
            All ({planned})
          </button>
        </div>
      </div>

      {/* Outlet List Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 pb-8">
        {toast && (
          <div className="bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-medium p-2.5 rounded-xl mb-1 flex items-center justify-between">
            {toast}
            <button onClick={() => setToast('')} className="text-amber-700 hover:text-amber-900"><span className="material-symbols-outlined text-[16px]">close</span></button>
          </div>
        )}
        
        {filtered.length > 0 ? (
          filtered.map(o => <OutletCard key={o.id} outlet={o} onSetStatus={setStatus} onSetAlternateName={setAlternateName} />)
        ) : (
          <div className="flex flex-col items-center justify-center pt-10 pb-8 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-3xl text-slate-400">store_off</span>
            </div>
            <h3 className="text-sm font-bold text-slate-700">No outlets found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>

    </div>
  )
}
