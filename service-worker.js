const CACHE_NAME = 'tolerie-shell-v2';
const SHELL_FILES = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Cache-first pour la coquille de l'appli, réseau direct pour tout le reste
// (Firestore, polices, librairies QR) afin de toujours avoir les données à jour.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isShellFile = SHELL_FILES.some((f) => url.pathname.endsWith(f.replace('./', '/')));

  if (isShellFile) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
  // sinon : laisser passer normalement (pas d'interception réseau)
});
