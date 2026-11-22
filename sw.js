// Service worker : met l'appli en cache pour qu'elle s'ouvre même sans réseau.
// Stratégie « stale-while-revalidate » : on sert la version en cache immédiatement
// et on télécharge la nouvelle version en arrière-plan (visible au lancement suivant).
const CACHE = 'monfit-v4';
const SHELL = [
  './', 'index.html', 'css/style.css', 'js/app.js', 'js/exercises.js', 'js/guides.js', 'js/programs.js', 'manifest.webmanifest',
  'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return; // Open Food Facts : toujours en direct
  e.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(req, { ignoreSearch: true });
    const network = fetch(req).then(res => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    if (cached) { e.waitUntil(network); return cached; }
    const res = await network;
    return res || (req.mode === 'navigate' ? cache.match('index.html') : Response.error());
  }));
});
