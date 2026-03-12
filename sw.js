const CACHE = "raspa-cache-v1"

const archivos = [
"/",
"index.html",
"main.js",
"canvas.css",
"https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.js"
];

self.addEventListener("install", (event) => {
  console.log("Service Worker instalado");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Guardando archivos en cache");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// activar el service worker
self.addEventListener("activate", (event) => {
  console.log("Service Worker activado");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// interceptar peticiones
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {

      // si existe en cache, lo usa
      if (response) {
        return response;
      }

      // si no existe, lo descarga
      return fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          console.log("Offline y archivo no encontrado:", event.request.url);
        });
    })
  );
});
