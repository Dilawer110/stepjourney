'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin() {
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.push('/')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Outlet Visits</h1>
      <input className="w-full max-w-sm border rounded-lg p-3 mb-3" placeholder="Email"
        value={email} onChange={e => setEmail(e.target.value)} />
      <input className="w-full max-w-sm border rounded-lg p-3 mb-3" placeholder="Password" type="password"
        value={password} onChange={e => setPassword(e.target.value)} />
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      <button onClick={handleLogin} className="w-full max-w-sm bg-blue-600 text-white rounded-lg p-3 font-semibold">
        Login
      </button>
    </div>
  )
}
