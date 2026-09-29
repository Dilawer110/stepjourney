'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy,setBusy] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const login = email.trim().toLowerCase()
    const authEmail = login.includes('@') ? login : `${login}@login.stepjourney.invalid`
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password })
    setBusy(false)
    if (error) setError(error.message)
    else window.location.assign('/stepjourney/')
  }

  return (
    <form onSubmit={handleLogin} className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">StepJourney</h1>
      <input className="w-full max-w-sm border rounded-lg p-3 mb-3" placeholder="Login ID (e.g. D0002OB19)" aria-label="Login ID" autoComplete="username" required
        value={email} onChange={e => setEmail(e.target.value)} />
      <input className="w-full max-w-sm border rounded-lg p-3 mb-3" placeholder="Password" type="password" autoComplete="current-password" required
        value={password} onChange={e => setPassword(e.target.value)} />
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      <button type="submit" disabled={busy} className="w-full max-w-sm bg-blue-600 text-white rounded-lg p-3 font-semibold">
        {busy ? 'Signing in…' : 'Login'}
      </button>
    </form>
  )
}

