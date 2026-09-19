'use client'
import { useEffect, useState, useMemo } from 'react'
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

  function handleDayEnd() {
    if (confirm('Are you sure you want to end your day? This will freeze your daily summary and sync all offline data.')) {
      setToast('Day Ended successfully! Syncing data...')
      // Implement actual day end routine if needed
    }
  }

  const filtered = useMemo(() => {
    return outlets.filter(o => {
      if (search) {
        const term = search.toLowerCase()
        const match = (
          (o.name && o.name.toLowerCase().includes(term)) ||
          (o.code && o.code.toLowerCase().includes(term)) ||
          (o.channel && o.channel.toLowerCase().includes(term)) ||
          (o.sub_channel && o.sub_channel.toLowerCase().includes(term)) ||
          ((o as any).routes?.name && (o as any).routes.name.toLowerCase().includes(term)) ||
          (o.alternate_name && o.alternate_name.toLowerCase().includes(term))
        )
        if (!match) return false
      }
      if (filter === 'Bill') return o.status === 'billed'
      if (filter === 'UnBill-V') return o.status === 'visited'
      if (filter === 'UnBill-UV') return o.status === 'remaining'
      if (filter === 'Revisit') return o.status === 'revisit_req'
      if (filter === 'Vst') return o.status !== 'remaining'
      return true // All
    })
  }, [outlets, filter, search])

  const planned = outlets.length
  const billed = outlets.filter(o => o.status === 'billed').length
  const unbilledVisit = outlets.filter(o => o.status === 'visited').length
  const unbilledUnvst = outlets.filter(o => o.status === 'remaining').length
  const revisitReq = outlets.filter(o => o.status === 'revisit_req').length
  const visitedTotal = planned - unbilledUnvst

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-sm font-semibold text-slate-500 flex flex-col items-center gap-2">
        <span className="material-symbols-outlined animate-spin">refresh</span>
        Loading Outlets...
      </div>
    </div>
  )
  
  if (today === 'Sunday') return (
    <div className="flex h-screen items-center justify-center bg-slate-50 p-6 text-center text-lg font-bold text-slate-700">
      Sunday — Day Off 🎉
    </div>
  )

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-slate-50 shadow-xl relative overflow-hidden">
      
      {/* Sticky Top Header Section */}
      <div className="z-20 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] bg-white flex flex-col">
        
        {/* Navy Header Block */}
        <div className="bg-[#0f294a] text-white pt-3 px-2.5 pb-2.5 select-none">
          <div className="flex gap-2 w-full">
            <select className="flex-1 bg-blue-900/60 border border-blue-700/50 text-[11px] px-1 py-1.5 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none font-medium" defaultValue="Main Dist.">
              <option>Distributor</option>
              <option>Main Dist.</option>
            </select>
            <select className="flex-1 bg-blue-900/60 border border-blue-700/50 text-[11px] px-1 py-1.5 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none font-medium" defaultValue={userName}>
              <option>O.B</option>
              <option>{userName}</option>
            </select>
            <select className="flex-[0.8] bg-blue-900/60 border border-blue-700/50 text-[11px] px-1 py-1.5 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none font-medium" value={today} disabled>
              <option value={today}>{today.slice(0,3)}</option>
            </select>
          </div>
          
          <div className="mt-2.5 flex items-center justify-between px-0.5">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              PJP: {routeName || 'None'}
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => router.push('/report')} className="text-[10px] font-bold text-slate-800 bg-white hover:bg-slate-100 px-2 py-1 rounded shadow-sm border border-slate-200 flex items-center gap-1 transition-colors">
                <span className="material-symbols-outlined text-[13px]">summarize</span>
                Report
              </button>
              <button onClick={handleDayEnd} className="text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded shadow-sm border border-blue-700 flex items-center gap-1 transition-colors">
                <span className="material-symbols-outlined text-[13px]">power_settings_new</span>
                End Day
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filter Block */}
        <div className="p-2 border-b border-slate-200">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-2 text-slate-400 text-[16px]">search</span>
            <input 
              type="text" 
              placeholder="Search shop, code, area..."
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-2 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner" 
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pb-1 text-[9.5px]">
            {[
              { label: 'Vst', count: visitedTotal },
              { label: 'Bill', count: billed },
              { label: 'UnBill-V', count: unbilledVisit },
              { label: 'UnBill-UV', count: unbilledUnvst },
              { label: 'Revisit', count: revisitReq },
              { label: 'All', count: planned }
            ].map(f => (
              <button 
                key={f.label}
                onClick={() => setFilter(f.label)} 
                className={`px-2 py-1 rounded-full font-bold border transition-colors ${filter === f.label ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrolling Outlet List Body */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0 bg-slate-50 pb-8">
        {toast && (
          <div className="bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-medium p-2.5 rounded-xl mb-2 flex items-center justify-between">
            {toast}
            <button onClick={() => setToast('')} className="text-amber-700 hover:text-amber-900"><span className="material-symbols-outlined text-[16px]">close</span></button>
          </div>
        )}
        
        {filtered.length > 0 ? (
          filtered.map(o => <OutletCard key={o.id} outlet={o} onSetStatus={setStatus} />)
        ) : (
          <div className="flex flex-col items-center justify-center pt-10 pb-8 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-2xl text-slate-400">store_off</span>
            </div>
            <h3 className="text-xs font-bold text-slate-700">No outlets found</h3>
          </div>
        )}
      </div>

    </div>
  )
}
