// Sub-Zero v1.37 PWA Service Worker - osepulveda1810-design
const CACHE_NAME = 'subzero-v1-37-standalone-landscape';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './assets/sprites/player/idle_subzero.png',
  './assets/sprites/player/walk_subzero.png',
  './assets/sprites/player/jump_subzero.png',
  './assets/sprites/player/punch_subzero.png',
  './assets/sprites/player/kick_subzero.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS).catch(()=>{})).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e=>{
  e.respondWith(
    caches.match(e.request).then(res=> res || fetch(e.request).then(f=>{
      // cache new assets
      return caches.open(CACHE_NAME).then(c=>{ c.put(e.request, f.clone()); return f; });
    }).catch(()=>caches.match('./index.html')))
  );
});
