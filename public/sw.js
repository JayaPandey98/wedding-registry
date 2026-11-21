// Minimal service worker: app-shell cache, network-first for pages.
// Cross-origin requests (Supabase API/auth) are never touched.
const CACHE = 'registry-v1'
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/', '/manifest.json', '/icon-192.png'])))
  self.skipWaiting()
})
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))))
  self.clients.claim()
})
self.addEventListener('fetch', (e) => {
  const r = e.request
  const u = new URL(r.url)
  if (r.method !== 'GET' || u.origin !== location.origin) return
  if (r.mode === 'navigate') {
    e.respondWith(
      fetch(r).then((res) => { const cp = res.clone(); caches.open(CACHE).then((c) => c.put('/', cp)); return res }).catch(() => caches.match('/'))
    )
    return
  }
  e.respondWith(
    caches.match(r).then((hit) => {
      const net = fetch(r).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(r, cp)) } return res }).catch(() => hit)
      return hit || net
    })
  )
})
