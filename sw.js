/* Skilltwork PWA Service Worker v3 — 强化离线：缓存优先 + 网络回填 */
const CACHE='skilltwork-v4';
const ASSETS=['./','./index.html','https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(ASSETS.map(a=>c.add(a)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  /* 页面导航：网络优先，失败回缓存（保证离线可开） */
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).then(res=>{const cl=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cl));return res}).catch(()=>caches.match('./index.html')));
    return;
  }
  /* 静态资源：缓存优先，网络回填 */
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
    if(res.ok&&(e.request.url.includes('cdn.jsdelivr.net')||e.request.url.includes('chart.js'))){const cl=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cl))}
    return res;
  }).catch(()=>hit)));
});
