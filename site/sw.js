// FocusFlow service worker — lets the app open and work offline.
// - The app page (index.html): network-first, falls back to the cached copy when offline.
// - Libraries from CDNs (Tailwind, Lucide, Firebase SDK, fonts): cache-first.
// - Google sign-in, Firestore and other API traffic is never touched (always goes to the network).
const CACHE_VERSION = 'focusflow-v15-persistent-errors-and-vision-routing';
const APP_SHELL = [
  './',
  './index.html',
  './css/styles.css',
  './js/audio.js',
  './js/state.js',
  './js/sync.js',
  './js/timeline.js',
  './js/calendar-categories.js',
  './js/kitchen.js',
  './js/chef.js',
  './js/nutrition.js',
  './js/health.js',
  './js/biometrics.js',
  './js/app.js'
];
const CDN_HOSTS = [
  'cdn.tailwindcss.com',
  'unpkg.com',
  'www.gstatic.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.jsdelivr.net'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isAppPage(request, url) {
  if (request.mode === 'navigate') return true;
  return url.origin === self.location.origin && (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html'));
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      // Store under the page URL without query string so ?params still work offline
      const url = new URL(request.url);
      url.search = '';
      url.hash = '';
      cache.put(url.toString(), response.clone()).catch(() => {});
    }
    return response;
  } catch (err) {
    const url = new URL(request.url);
    url.search = '';
    url.hash = '';
    const cached = (await cache.match(url.toString())) ||
      (await cache.match('./index.html')) ||
      (await cache.match('./'));
    if (cached) return cached;
    throw err;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  // Opaque (no-cors) responses have status 0 but are still usable from cache
  if (response && (response.ok || response.type === 'opaque')) {
    cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  let url;
  try { url = new URL(request.url); } catch (e) { return; }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return;
  // Never intercept Firebase Auth handler pages (/__/auth/...) or Google APIs
  if (url.pathname.startsWith('/__/')) return;
  if (url.hostname.endsWith('googleapis.com') && url.hostname !== 'fonts.googleapis.com') return;
  if (url.hostname === 'accounts.google.com' || (url.hostname.endsWith('firebaseapp.com') && url.origin !== self.location.origin)) return;

  if (url.origin === self.location.origin) {
    if (isAppPage(request, url)) {
      event.respondWith(networkFirst(request));
    } else if (url.pathname.endsWith('.webmanifest') || url.pathname.endsWith('.png') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
      event.respondWith(cacheFirst(request));
    }
    return;
  }

  if (CDN_HOSTS.indexOf(url.hostname) !== -1) {
    event.respondWith(cacheFirst(request));
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
