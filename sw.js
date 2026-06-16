/* Maze Runner — offline service worker.
   Caches every page on first online visit, then serves from cache. */
const CACHE = 'maze-runner-v2';
const PRECACHE = [
  './',
  'index.html',
  'index-nexus.html',
  'index-neon.html',
  'index-editorial.html',
  'index-city.html',
  'brief.html',
  'maze-plan.html',
  'code.html',
  'script.html',
  'maze-runner.ts',
  'manifest.webmanifest',
  'icon.svg',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first, with runtime caching of anything fetched (incl. Google Fonts).
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => cached);
    })
  );
});
