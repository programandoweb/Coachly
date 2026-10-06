const CACHE_NAME = 'migo-fit-v2';
const CORE_ASSETS = ['/', '/login', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Las peticiones a la API de Laravel nunca deben cachearse ni servirse desde
  // caché: los datos del backend (mediciones, rutinas, series, etc.) siempre
  // deben venir en vivo. Cachearlas hacía que un celular con conexión
  // intermitente mostrara datos viejos guardados en ese mismo dispositivo,
  // dando la falsa impresión de que lo guardado en otro celular no llegaba.
  const isApiRequest = url.origin !== self.location.origin;
  if (isApiRequest) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => undefined);
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/login')))
  );
});
