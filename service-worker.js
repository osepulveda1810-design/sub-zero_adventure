const CACHE_NAME = 'subzero-v1-75-assets-externos';
self.addEventListener('install', e=>{ self.skipWaiting(); });
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>{ if(k!==CACHE_NAME) return caches.delete(k); }))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e=>{
  if(e.request.url.includes('index.html') || e.request.url.includes('version.json') || e.request.url.includes('manifest.json') || e.request.url.includes('service-worker')){
    e.respondWith(fetch(e.request, {cache:'no-store'}).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r || fetch(e.request)));
});
