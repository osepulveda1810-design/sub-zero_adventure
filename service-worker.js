// Service Worker - Sub-Zero Adventure
// Sube este archivo a la RAÍZ del repo (mismo nivel que index.html) como "service-worker.js"

const CACHE_VERSION = 'subzero-v1';
const CACHE_NAME = `subzero-adventure-${CACHE_VERSION}`;

// Todo lo necesario para que el juego cargue y funcione sin conexión.
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',

  // Sprites del personaje
  './idle_subzero.png',
  './walk_subzero.png',
  './jump_subzero.png',
  './kick_subzero.png',
  './kick_subzero2.png',
  './kick_air.png',
  './punch_subzero.png',
  './punch_subzero2.png',
  './punch_air.png',

  // Sprites de hielo
  './subzero_ice_charge.png',
  './subzero_ice1.png',
  './subzero_ice2.png',
  './ice.png',

  // Íconos PWA
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png'
];

// ─── INSTALACIÓN: precachear todo lo de arriba ───
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// ─── ACTIVACIÓN: borrar cachés de versiones viejas ───
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name.startsWith('subzero-adventure-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── FETCH: cache-first, con fallback a la red y actualización en segundo plano ───
self.addEventListener('fetch', (event) => {
  // Solo manejamos peticiones GET del mismo origen (evita romper llamadas externas/analytics)
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse); // sin conexión: usa lo que haya en caché

      // Si ya está en caché, respondemos al instante y actualizamos en segundo plano (stale-while-revalidate).
      // Si no está en caché, esperamos a la red.
      return cachedResponse || networkFetch;
    })
  );
});
