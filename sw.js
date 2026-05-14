const CACHE = 'uniglyph-v164';
const ASSETS = [
  '/uniglyph/',
  '/uniglyph/index.html',
  '/uniglyph/manifest.json',
  '/uniglyph/icon.png',
  '/uniglyph/icon-192.png',
  '/uniglyph/icon-512.png'
];

// Install: cache all assets, but don't skipWaiting yet —
// wait until the app prompts the user to update
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
});

// Activate: clear old caches, take control of all clients
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: serve from cache, fall back to network
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return response;
      }).catch(() => caches.match('/uniglyph/index.html'));
    })
  );
});

// Message: when app says SKIP_WAITING, activate immediately
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
