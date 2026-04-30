// App-shell + asset cache for Pinit Clock.
// Versioning the cache name busts old caches on deploy.

const CACHE_VERSION = 'v2'
const APP_SHELL_CACHE = `pinit-shell-${CACHE_VERSION}`
const ASSET_CACHE = `pinit-assets-${CACHE_VERSION}`

// Files that make up the app shell — must be available offline for the
// PWA to open. Paths are relative to the SW scope.
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './pinit-clock.svg',
  './pinit-clock-maskable.svg',
  './404.html',
]

self.addEventListener('install', (e) => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(APP_SHELL_CACHE)
      // Use { cache: 'reload' } so installs always pull fresh shell files.
      await cache.addAll(APP_SHELL.map((path) => new Request(path, { cache: 'reload' })))
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys()
      // Delete any cache that doesn't match the current version.
      await Promise.all(
        keys
          .filter((k) => !k.endsWith(CACHE_VERSION))
          .map((k) => caches.delete(k)),
      )
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  const sameOrigin = url.origin === self.location.origin

  // Cross-origin (Unsplash, weather, archive.org) → network-only, never cache.
  if (!sameOrigin) return

  // Hashed asset bundles → cache-first (immutable).
  if (url.pathname.includes('/assets/')) {
    e.respondWith(cacheFirst(request, ASSET_CACHE))
    return
  }

  // Navigation requests (HTML) → network-first with shell fallback so updates
  // are picked up when online but the app still opens when offline.
  if (request.mode === 'navigate') {
    e.respondWith(networkFirstWithShellFallback(request))
    return
  }

  // Other shell items → stale-while-revalidate.
  e.respondWith(staleWhileRevalidate(request, APP_SHELL_CACHE))
})

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached
  const res = await fetch(request)
  if (res.ok) cache.put(request, res.clone())
  return res
}

async function networkFirstWithShellFallback(request) {
  try {
    const res = await fetch(request)
    const cache = await caches.open(APP_SHELL_CACHE)
    cache.put('./index.html', res.clone())
    return res
  } catch {
    const cache = await caches.open(APP_SHELL_CACHE)
    const cached = (await cache.match('./index.html')) || (await cache.match('./'))
    if (cached) return cached
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const networkPromise = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone())
      return res
    })
    .catch(() => null)
  return cached || (await networkPromise) || new Response('', { status: 504 })
}
