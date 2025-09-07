self.addEventListener('install', (e) => {
  e.waitUntil(self.skipWaiting())
})
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim())
})
self.addEventListener('fetch', (e) => {
  const { request } = e
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  // cache-first for static assets
  if (url.pathname.includes('/assets/')) {
    e.respondWith((async () => {
      const cache = await caches.open('static-v1')
      const cached = await cache.match(request)
      if (cached) return cached
      const res = await fetch(request)
      cache.put(request, res.clone())
      return res
    })())
  }
})


