'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
export default function Account() {
 const [password,setPassword]=useState('')
 const [confirmation,setConfirmation]=useState('')
 const [message,setMessage]=useState('')
 const [busy,setBusy]=useState(false)
 const router=useRouter()
 async function change(e:React.FormEvent) {
  e.preventDefault(); setMessage('')
  if(password.length<12 || password!==confirmation) {setMessage('Use at least 12 characters and enter the same password twice.');return}
  setBusy(true)
  try {
   const {error}=await supabase.auth.updateUser({password})
   if(error) throw error
   setPassword('');setConfirmation('');setMessage('Password changed successfully.')
  } catch(e) {setMessage(e instanceof Error ? e.message : 'Password change failed. Please retry.')}
  finally {setBusy(false)}
 }
 return <form onSubmit={change} className="max-w-md mx-auto p-6 flex flex-col gap-4">
  <h1 className="text-xl font-bold">Change password</h1>
  <p className="text-sm">Replace your temporary password with a password only you know.</p>
  <input aria-label="New password" placeholder="New password" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={e=>setPassword(e.target.value)} className="border rounded p-3"/>
  <input aria-label="Confirm password" placeholder="Confirm password" type="password" autoComplete="new-password" required value={confirmation} onChange={e=>setConfirmation(e.target.value)} className="border rounded p-3"/>
  <p role="status">{message}</p><button disabled={busy} className="bg-blue-700 text-white rounded p-3">{busy?'Saving…':'Change password'}</button>
  <button type="button" onClick={()=>router.push('/')}>Back to app</button>
 </form>
}

