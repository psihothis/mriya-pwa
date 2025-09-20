
const VERSION = 'v12-3';
const CACHE = `mriya-cache-${VERSION}`;
const ASSETS = ['index.html','app.js'];
self.addEventListener('install', e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e=>{
  const u = new URL(e.request.url);
  if (u.origin===location.origin){ e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))); }
  else { e.respondWith(fetch(e.request).catch(()=>caches.match(e.request))); }
});