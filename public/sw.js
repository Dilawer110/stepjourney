// Cache only public static resources. Supabase/auth requests and mutations
// always go to the network and are never stored by this worker.
const CACHE = 'stepjourney-static-v2'
const ROOT = '/stepjourney/'
const FALLBACK = ROOT + 'offline.html'
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll([
    FALLBACK, ROOT + 'manifest.webmanifest', ROOT + 'icons/icon-192.png', ROOT + 'icons/icon-512.png',
  ])))
})
// Let existing tabs finish before activating an updated worker.
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith('stepjourney-static-') && key !== CACHE)
    .map(key => caches.delete(key)))).then(() => self.clients.claim()))
})
self.addEventListener('fetch', event => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(ROOT)) return
  // Keep Next.js RSC requests separate from navigation HTML.
  if (request.headers.get('RSC') || url.searchParams.has('_rsc')) return
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE)
      try {
        const response = await fetch(request)
        if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
          // Static export HTML has no user-specific server content or query data.
          await cache.put(url.pathname, response.clone()).catch(() => {})
        }
        return response
      } catch {
        return await cache.match(url.pathname) || await cache.match(FALLBACK) || Response.error()
      }
    })())
    return
  }
  if (url.pathname.startsWith(ROOT + '_next/static/')) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE)
      const cached = await cache.match(request)
      if (cached) return cached
      const response = await fetch(request)
      if (response.ok) await cache.put(request, response.clone()).catch(() => {})
      return response
    })())
  }
})

