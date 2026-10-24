const C='dayspring-v5';
const ASSETS=['/','/icon.svg','/icon-192.png','/manifest.webmanifest'];
const HOSTS=['geocoding-api.open-meteo.com','archive-api.open-meteo.com','en.wikipedia.org'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(ASSETS)).catch(()=>{}))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(HOSTS.includes(u.hostname)){
    e.respondWith(caches.open(C).then(async c=>{
      const hit=await c.match(e.request);
      if(hit)return hit;
      const r=await fetch(e.request);
      if(r.ok)c.put(e.request,r.clone());
      return r;
    }).catch(()=>caches.match(e.request)));
    return;
  }
  if(u.origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{
    if(r.ok){const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));}
    return r;
  }).catch(()=>caches.match(e.request,{ignoreSearch:true})));
});
