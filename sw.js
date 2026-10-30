/* Offline support. Bump VERSION whenever app files change. */
const VERSION = 'kural-v6';
const SHELL = [
  './',
  'index.html',
  'css/styles.css',
  'js/config.js',
  'js/search.js',
  'js/app.js',
  'data/index.json',
  'assets/chapter-placeholder.jpg',
  'manifest.webmanifest',
  'assets/icons/icon-192.png',
  'assets/fonts/anek-tamil-400.woff2',
  'assets/fonts/anek-tamil-500.woff2',
  'assets/fonts/anek-tamil-600.woff2',
  'assets/fonts/anek-tamil-700.woff2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// App files: network first so updates show up, cache as fallback.
// Chapters and fonts: cache first, saved the first time they are opened.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isChapter = url.pathname.includes('/data/chapters/') || url.pathname.endsWith('/data/search.json');
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

  if (isChapter || isFont) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
        return res;
      }))
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => caches.match(req).then((hit) => hit || caches.match('index.html')))
    );
  }
});
