// Service Worker para Juego del Ahorcado PWA
const CACHE_NAME = 'ahorcado-game-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Archivos que se cachearán
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/offline.html'
];

// Instalar Service Worker
self.addEventListener('install', event => {
  console.log('SW: Instalando Ahorcado...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Cacheando archivos del juego');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('SW: Juego cacheado exitosamente');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('SW: Error al cachear:', error);
      })
  );
});

// Activar Service Worker
self.addEventListener('activate', event => {
  console.log('SW: Activando Ahorcado...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('SW: Ahorcado activado');
      return self.clients.claim();
    })
  );
});

// Interceptar peticiones
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(response => {
            if (response && response.status === 200 && response.type === 'basic') {
              const responseToCache =
