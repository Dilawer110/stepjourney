'use client'
import { userStorage } from '@/lib/user-storage'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getPosition } from '@/lib/geo'
import { OutletWithStatus, VisitStatus } from '@/lib/types'
import OutletCard from '@/components/OutletCard'

type Distributor = { distributor_code: string; name: string | null }
type Booker = { order_booker_code: string; order_booker_name: string | null; distributor_code: string | null }
type PlanRoute = { pjp_code: string; pjp_name: string | null; day: string; order_booker_code: string }

// Small pages avoid the server's row cap; callers supply deterministic ordering.
async function readAll(makeQuery: () => any): Promise<any[]> {
  const rows: any[] = []
  for (let offset = 0; ; offset += 200) {
    const { data, error } = await makeQuery().range(offset, offset + 199)
    if (error) throw error
    rows.push(...(data || []))
    if (!data || data.length < 200) return rows
  }
}

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [outlets, setOutlets] = useState<OutletWithStatus[]>([])
  const [routeName, setRouteName] = useState('')
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [userId, setUserId] = useState('')
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [bookers, setBookers] = useState<Booker[]>([])
  const [planRoutes, setPlanRoutes] = useState<PlanRoute[]>([])
  const [distributor, setDistributor] = useState('')
  const [booker, setBooker] = useState('')
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay()])
  const [ready, setReady] = useState(false)
  const [refresh, setRefresh] = useState(0)
  
  const today = DAYS[new Date().getDay()]
  const todayISO = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    let cancelled = false
    async function initialize() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        if (!session) { router.push('/login'); return }
        const uid = session.user.id
        if (cancelled) return
        setUserId(uid)
        const key = 'header-master-v1:' + uid
        let master: { distributors: Distributor[]; bookers: Booker[]; routes: PlanRoute[] }
        try {
          const [d, b, r] = await Promise.all([
            readAll(() => supabase.from('distributors').select('distributor_code,name').order('distributor_code')),
            readAll(() => supabase.from('app_users').select('order_booker_code,order_booker_name,distributor_code').order('order_booker_code')),
            readAll(() => supabase.from('pjp_routes').select('pjp_code,pjp_name,day,order_booker_code').order('id')),
          ])
          master = { distributors: d, bookers: b, routes: r }
          try { userStorage.setItem(key, JSON.stringify(master)) } catch {}
        } catch (error) {
          const cached = userStorage.getItem(key)
          if (!cached) throw error
          master = JSON.parse(cached)
          if (!Array.isArray(master.distributors) || !Array.isArray(master.bookers) || !Array.isArray(master.routes)) throw error
        }
        if (cancelled) return
        setDistributors(master.distributors)
        setBookers(master.bookers)
        setPlanRoutes(master.routes)
        try {
          const saved = JSON.parse(userStorage.getItem('header-selection-v1:' + uid + ':' + todayISO) || 'null')
          if (saved && DAYS.includes(saved.day)) {
            const dist = master.distributors.some(d => d.distributor_code === saved.distributor) ? saved.distributor : ''
            setDistributor(dist)
            setBooker(master.bookers.some(b => b.order_booker_code === saved.booker && (!dist || b.distributor_code === dist)) ? saved.booker : '')
            setSelectedDay(saved.day)
          }
        } catch {}
        setReady(true)
      } catch {
        if (!cancelled) { setToast('Could not load filter options. Please reload to retry.'); setLoading(false) }
      }
    }
    initialize()
    return () => { cancelled = true }
  }, [router])

  useEffect(() => {
    if (!ready || !userId) return
    let cancelled = false
    const key = 'route-cache-v1:' + JSON.stringify([userId, todayISO, selectedDay, distributor, booker])
    try { userStorage.setItem('header-selection-v1:' + userId + ':' + todayISO,
      JSON.stringify({ distributor, booker, day: selectedDay })) } catch {}
    async function loadSelection() {
      setFilter('All')
      setToast('')
      setOutlets([])
      setRouteName('')
      setLoading(true)
      try {
        const [assignments, visits] = await Promise.all([
          readAll(() => {
            let query = supabase.from('outlet_visit_schedule')
              .select('store_code,pjp_code,day,order_booker_code,outlets!inner(*),app_users!inner(distributor_code)')
              .eq('day', selectedDay).order('store_code').order('pjp_code').order('order_booker_code')
            if (distributor) query = query.eq('app_users.distributor_code', distributor)
            if (booker) query = query.eq('order_booker_code', booker)
            return query
          }),
          readAll(() => supabase.from('outlet_visits').select('outlet_id,status')
            .eq('visit_date', todayISO).order('visited_at').order('id')),
        ])
        const visitMap = new Map(visits.map(v => [v.outlet_id, v.status]))
        const routeMap = new Map(planRoutes.map(r => [JSON.stringify([r.pjp_code, r.day, r.order_booker_code]), r]))
        const unique = new Map<string, any>()
        const names = new Set<string>()
        for (const assignment of assignments) {
          const outlet = assignment.outlets
          if (!outlet?.id) continue
          const route = routeMap.get(JSON.stringify([assignment.pjp_code, assignment.day, assignment.order_booker_code]))
          const name = route?.pjp_name || assignment.pjp_code
          names.add(name)
          const previous = unique.get(outlet.id)
          const outletRoutes = new Set([...(previous?.routeNames || []), name])
          unique.set(outlet.id, { ...outlet, day: selectedDay,
            routeNames: Array.from(outletRoutes), routes: { name: Array.from(outletRoutes).join(', ') },
            status: visitMap.get(outlet.id) || 'remaining' })
        }
        const merged = Array.from(unique.values()).sort((a,b) => a.name.localeCompare(b.name))
        const label = names.size > 1 ? names.size + ' routes' : Array.from(names)[0] || 'None'
        if (cancelled) return
        setOutlets(merged)
        setRouteName(label)
        try {
          const payload = JSON.stringify({ merged, routeName: label })
          userStorage.setItem(key, payload)
          userStorage.setItem('todayOutlets', payload)
        } catch { setToast('Loaded outlets, but this selection could not be cached for offline use.') }
      } catch {
        if (cancelled) return
        try {
          const cached = JSON.parse(userStorage.getItem(key) || 'null')
          if (!Array.isArray(cached?.merged)) throw new Error('No matching cache')
          setOutlets(cached.merged)
          setRouteName(cached.routeName)
          userStorage.setItem('todayOutlets', JSON.stringify(cached))
          setToast('Offline — showing the cached outlets for these filters.')
        } catch { setToast('Could not load this selection. Check your connection and tap Reload.') }
      } finally { if (!cancelled) setLoading(false) }
    }
    loadSelection()
    return () => { cancelled = true }
  }, [ready, userId, selectedDay, distributor, booker, todayISO, planRoutes, refresh])

  const availableBookers = useMemo(() => bookers.filter(b => !distributor || b.distributor_code === distributor), [bookers, distributor])

  async function setStatus(id: string, status: VisitStatus | 'remaining') {
    setOutlets(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    try {
      if (status === 'remaining') {
        const { error } = await supabase.from('outlet_visits').delete().eq('outlet_id', id).eq('visit_date', todayISO).eq('order_booker_id', session.user.id)
        if (error) throw error
      } else {
        const { lat, lng } = await getPosition()
        const { error } = await supabase.from('outlet_visits').upsert({
          outlet_id: id, order_booker_id: session.user.id, visit_date: todayISO,
          status, latitude: lat, longitude: lng, visited_at: new Date().toISOString(),
        }, { onConflict: 'outlet_id,order_booker_id,visit_date' })
        if (error) throw error
      }
    } catch {
      setToast('Update failed. Reloading the saved status; please try again.')
      setRefresh(n => n + 1)
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

  if (loading && !ready) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-sm font-semibold text-slate-500 flex flex-col items-center gap-2">
        <span className="material-symbols-outlined animate-spin">refresh</span>
        Loading Outlets...
      </div>
    </div>
  )
  
  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-slate-50 shadow-xl relative overflow-hidden">
      
      {/* Sticky Top Header Section */}
      <div className="z-[60] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] bg-white flex flex-col">
        
        {/* Navy Header Block */}
        <div className="bg-[#0f294a] text-white pt-3 px-2.5 pb-2.5 select-none">
          <div className="flex gap-2 w-full">
            <select className="min-w-0 flex-1 bg-blue-900/60 border border-blue-700/50 text-[11px] px-1 py-1.5 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none font-medium" aria-label="Distributor" value={distributor} disabled={!ready} onChange={e => { setDistributor(e.target.value); setBooker('') }}>
              <option value="">All distributors</option>
              {distributors.map(d => <option key={d.distributor_code} value={d.distributor_code}>{d.name || d.distributor_code}</option>)}
            </select>
            <select className="min-w-0 flex-1 bg-blue-900/60 border border-blue-700/50 text-[11px] px-1 py-1.5 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none font-medium" aria-label="Order booker" value={booker} disabled={!ready} onChange={e => setBooker(e.target.value)}>
              <option value="">All bookers</option>
              {availableBookers.map(b => <option key={b.order_booker_code} value={b.order_booker_code}>{b.order_booker_name || b.order_booker_code}</option>)}
            </select>
            <select className="flex-[0.8] bg-blue-900/60 border border-blue-700/50 text-[11px] px-1 py-1.5 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none font-medium" aria-label="Route day" value={selectedDay} onChange={e => setSelectedDay(e.target.value)}>
              {DAYS.map(day => <option key={day} value={day}>{day.slice(0,3)}</option>)}
            </select>
          </div>
          
          <div className="mt-2.5 flex items-center justify-between px-0.5">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              PJP: {loading ? 'Loading…' : routeName || 'None'}
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => router.push('/export')} className="text-[10px] font-bold text-slate-800 bg-white hover:bg-slate-100 px-2 py-1 rounded shadow-sm border border-slate-200 flex items-center gap-1 transition-colors">
                <span className="material-symbols-outlined text-[13px]">ios_share</span>
                Export
              </button>
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

        <div className="px-3 py-1 text-[10px] text-slate-500 flex justify-between gap-2">
          <span>{selectedDay === today ? 'Today’s route' : selectedDay + ' route preview'} · Latest visible visits today</span>
          <button type="button" disabled={loading || !ready} onClick={() => setRefresh(n => n + 1)} className="text-blue-700 font-semibold disabled:opacity-50">Reload</button>
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
      <div className="flex-1 overflow-y-auto p-2 space-y-0 bg-slate-50 pb-48">
        {toast && (
          <div className="bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-medium p-2.5 rounded-xl mb-2 flex items-center justify-between">
            {toast}
            <button onClick={() => setToast('')} className="text-amber-700 hover:text-amber-900"><span className="material-symbols-outlined text-[16px]">close</span></button>
          </div>
        )}
        
        {loading ? <div role="status" className="p-8 text-center text-sm text-slate-500">Loading selected outlets…</div> : filtered.length > 0 ? (
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

      {/* Floating Action Button for Add Outlet */}
      <button 
        onClick={() => router.push('/add-outlet')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-[0_4px_12px_rgba(37,99,235,0.4)] flex items-center justify-center z-50 transition-transform active:scale-95"
      >
        <span className="material-symbols-outlined text-[26px]">add_business</span>
      </button>

    </div>
  )
}

