// Hub Énergie+ : permet d'installer l'application et de l'ouvrir même sans connexion.
// Toujours la version en ligne d'abord (les mises à jour arrivent toutes seules),
// la copie gardée en mémoire seulement si internet est coupé.
const CACHE = 'energie-plus-v5';
const FICHIERS = ['./', 'index.html', 'manifest.webmanifest?v=4', 'favicon.ico',
  'icons/icon-192-v4.png', 'icons/icon-512-v4.png', 'icons/icon-maskable-512-v4.png',
  'icons/apple-touch-icon-v4.png', 'icons/favicon-32.png',
  'img/logo.webp', 'img/camion-debut.jpg', 'img/fond.jpg', 'fonts/outfit-latin.woff2', 'fonts/outfit-latin-ext.woff2'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((cles) => Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // La vidéo est lue directement depuis internet (le navigateur la charge par morceaux).
  if (e.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.endsWith('.mp4')) return;
  e.respondWith(
    fetch(e.request)
      .then((rep) => {
        const copie = rep.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copie));
        return rep;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('./')))
  );
});
