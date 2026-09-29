'use client'
import { useEffect, useState, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { setStorageIdentity } from '@/lib/user-storage'

type Access = { user_id: string; display_name: string; role: string; active: boolean; zone: string | null; distributor_code: string | null; order_booker_code: string | null; access_version: number }
const labels: Record<string,string> = { super_admin: 'Super Admin · RSM Central', asm: 'Admin · ASM', tse: 'Supervisor · TSE', worker: 'Worker · Order Booker' }
export default function AccessGate({ children }: { children: React.ReactNode }) {
 const path = usePathname()
 const router = useRouter()
 const verified = useRef<Access | null>(null)
 const [access,setAccess] = useState<Access | null>(null)
 const [error,setError] = useState('')
 const [attempt,setAttempt] = useState(0)
 const [checkedPath,setCheckedPath] = useState('')
 const login = /\/login\/?$/.test(path)
 useEffect(() => {
  let disposed=false
  let request=0
  async function check() {
   const sequence=++request
   setCheckedPath('')
   setAccess(null)
   setStorageIdentity(null)
   setError('')
   if (login) { setCheckedPath(path); return }
   try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    if (!session) { router.replace('/login'); return }
    if (!navigator.onLine && verified.current?.user_id === session.user.id && !/\/account\/?$/.test(path)) {
     const a = verified.current
     setStorageIdentity(a.user_id,JSON.stringify([a.role,a.zone,a.distributor_code,a.order_booker_code,a.access_version]))
     setAccess(a);setCheckedPath(path);return
    }
    const { data,error } = await supabase.from('user_access').select('*').eq('user_id',session.user.id).single()
    if (disposed || request!==sequence) return
    if (error || !data?.active) throw new Error('Your account has no active access assignment. Contact Dilawer Hussain.')
    const { data: mustChange, error: passwordError } = await supabase.rpc('needs_password_change')
    if (passwordError) throw passwordError
    if (disposed || request!==sequence) return
    if (mustChange && !/\/account\/?$/.test(path)) { router.replace('/account'); return }
    const a=data as Access
    if (verified.current && JSON.stringify(verified.current)!==JSON.stringify(a)) {window.location.reload();return}
    if (!mustChange) verified.current=a
    setStorageIdentity(a.user_id,JSON.stringify([a.role,a.zone,a.distributor_code,a.order_booker_code,a.access_version]))
    setAccess(a)
    setCheckedPath(path)
   } catch(e) {
    if (!disposed && request===sequence) setError(e instanceof Error ? e.message : 'Connect to the internet to verify your access, then retry.')
   }
  }
  check()
  // Schedule outside the Auth callback to avoid nested auth-client locks.
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
   if (event==='SIGNED_OUT') { setStorageIdentity(null); window.location.replace('/stepjourney/login/'); return }
   if (event==='SIGNED_IN') setTimeout(() => { if(!disposed) check() },0)
  })
  const recheck=()=>check()
  window.addEventListener('online',recheck)
  return () => { disposed=true; request++; subscription.unsubscribe(); window.removeEventListener('online',recheck) }
 },[path,login,attempt,router])
 async function signOut() {
  setAccess(null); setCheckedPath(''); setStorageIdentity(null)
  await supabase.auth.signOut({scope:'local'})
  window.location.replace('/stepjourney/login/')
 }
 if (login) return <>{children}</>
 if (!access || checkedPath!==path) return <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-4 text-center">
  <p>{error || 'Checking your access…'}</p>
  {error && <><button className="text-blue-700" onClick={()=>setAttempt(n=>n+1)}>Retry</button><button onClick={signOut}>Sign out</button></>}
 </div>
 return <><div className="print:hidden max-w-md mx-auto bg-slate-900 text-white px-3 py-2 flex items-center justify-between gap-2 text-xs">
  <div><strong>{access.display_name}</strong><div>{labels[access.role]}{access.zone ? ` · ${access.zone}` : ''}</div></div>
  <div className="flex gap-3"><button onClick={()=>router.push('/account')}>Account</button><button onClick={signOut}>Sign out</button></div>
 </div><div key={access.user_id}>{children}</div></>
}

