'use client'
import { useEffect } from 'react'

export default function PwaRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/stepjourney/sw.js', {
      scope: '/stepjourney/', updateViaCache: 'none',
    }).catch(error => console.warn('Offline support could not be registered', error))
  }, [])
  return null
}

