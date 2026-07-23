const CACHE_NAME = 'subzero-v1-41-clean-final';
self.addEventListener('install', e=>{ self.skipWaiting(); });
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  if(url.pathname.includes('index.html') || url.pathname.endsWith('/') || url.pathname.endsWith('version.json') || url.pathname.endsWith('manifest.json')){
    e.respondWith(fetch(e.request, {cache:'no-store'}).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r || fetch(e.request)));
});
