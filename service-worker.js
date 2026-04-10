const CACHE_NAME = "aboao-site-v2";
const OFFLINE_URL = "/offline.html";
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/assets/css/main.css",
  "/assets/js/main.js",
  "/assets/js/effects.js",
  "/assets/js/pwa.js",
  "/articles/puzzle-love.html",
  "/images/A.ico",
  "/images/LOGO.svg",
  "/images/%E7%8E%8B%E6%89%BF%E7%9A%93.jpg",
  "/assets/css/images/%E7%B6%B2%E9%A0%81%E5%BA%95%E5%9C%96.png",
];

const shouldCache = (request, response) => {
  if (request.method !== "GET" || !response) {
    return false;
  }

  return response.ok || response.type === "opaque";
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (shouldCache(request, response)) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
