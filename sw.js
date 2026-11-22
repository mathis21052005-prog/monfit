// Service worker : permet à l'appli de s'ouvrir sans réseau.
// Stratégie « réseau d'abord » : si internet répond (en moins de 3 s), on prend la dernière version
// publiée sur GitHub ; sinon, on sert la copie en cache. Les mises à jour arrivent donc dès l'ouverture suivante.
const CACHE = 'monfit-v7';
const SHELL = [
  './', 'index.html', 'css/style.css', 'js/app.js', 'js/exercises.js', 'js/guides.js', 'js/programs.js',
  'manifest.webmanifest', 'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png',
];
const IMAGES = ["ab-wheel.jpg", "abduction.jpg", "bench-bb.jpg", "bench-db.jpg", "bench-dips.jpg", "bike.jpg", "bulgarian.jpg", "cable-crunch.jpg", "cable-curl.jpg", "cable-fly.jpg", "calf-press.jpg", "calf-seated.jpg", "calf-standing.jpg", "chest-press.jpg", "chinup.jpg", "close-bench.jpg", "crunch.jpg", "curl-bb.jpg", "curl-db.jpg", "curl-ez.jpg", "deadlift.jpg", "decline-bb.jpg", "dips.jpg", "elliptical.jpg", "face-pull.jpg", "fly-db.jpg", "front-raise.jpg", "front-squat.jpg", "glute-bridge.jpg", "glute-kickback.jpg", "goblet.jpg", "good-morning.jpg", "hack-squat.jpg", "hammer-curl.jpg", "hanging-leg-raise.jpg", "hip-thrust.jpg", "hyperext.jpg", "incline-bb.jpg", "incline-curl.jpg", "incline-db.jpg", "jump-rope.jpg", "kickback.jpg", "lat-pulldown-close.jpg", "lat-pulldown.jpg", "lateral-raise-cable.jpg", "lateral-raise.jpg", "leg-curl-lying.jpg", "leg-curl-seated.jpg", "leg-ext.jpg", "leg-press.jpg", "lunge-db.jpg", "ohp.jpg", "overhead-ext.jpg", "pec-deck.jpg", "plank.jpg", "preacher-curl.jpg", "pullover-cable.jpg", "pullup.jpg", "pushdown-bar.jpg", "pushdown-rope.jpg", "pushup.jpg", "rdl.jpg", "rear-delt.jpg", "reverse-pec-deck.jpg", "row-bb.jpg", "row-db.jpg", "row-machine.jpg", "rower.jpg", "russian-twist.jpg", "seated-row.jpg", "shoulder-press-db.jpg", "shoulder-press-m.jpg", "shrug.jpg", "side-plank.jpg", "skullcrusher.jpg", "squat.jpg", "stairs.jpg", "tbar-row.jpg", "treadmill.jpg", "upright-row.jpg"].map(f => 'img/ex/' + f);

self.addEventListener('install', e => {
  // cache: 'reload' évite de récupérer une ancienne copie depuis le cache HTTP du navigateur
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all([...SHELL, ...IMAGES].map(u => fetch(new Request(u, { cache: 'reload' })).then(r => r.ok && c.put(u, r)).catch(() => {}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

function fromNetwork(req, cache, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    fetch(req, { cache: 'no-cache' }).then(res => {
      clearTimeout(timer);
      if (res && res.ok) { cache.put(req, res.clone()); resolve(res); } else reject(new Error('bad response'));
    }).catch(err => { clearTimeout(timer); reject(err); });
  });
}

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return; // Open Food Facts : toujours en direct
  const isImage = url.pathname.includes('/img/') || url.pathname.includes('/icons/');
  e.respondWith(caches.open(CACHE).then(async cache => {
    if (isImage) { // images : cache d'abord (elles ne changent pas)
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req); if (res.ok) cache.put(req, res.clone()); return res;
    }
    try { return await fromNetwork(req, cache, 3000); }
    catch (err) {
      const hit = await cache.match(req, { ignoreSearch: true });
      return hit || (req.mode === 'navigate' ? cache.match('index.html') : Response.error());
    }
  }));
});
