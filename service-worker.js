const CACHE_NAME = "wrc-app-v20";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./config.js",
  "./entries-service.js",
  "./entries-utils.js",
  "./insights-rendering.js",
  "./scoring.js",
  "./utils.js",
  "./wurstrand-logo.png",
  "./wursti-monatsziel.png",
  "./wursti-run-sprite.png",
  "./wursti-wave.png",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./modules/daily/daily.css",
  "./modules/daily/daily-pool.js",
  "./modules/daily/daily-manager.js",
  "./modules/daily/daily-storage.js",
  "./modules/daily/daily.js",
  "./modules/dart/dart.css",
  "./modules/dart/dart.js",
  "./modules/frisbee/frisbee.css",
  "./modules/frisbee/frisbee.js",
  "./modules/uno/uno.css",
  "./modules/uno/uno.js",
  "./modules/game-collection/game-collection.css",
  "./modules/game-collection/game-collection.js",
  "./modules/mascots/mascots.css",
  "./modules/mascots/mascots.js",
  "./modules/post/post.css",
  "./modules/post/post-data.js",
  "./modules/post/post.js",
  "./modules/community-birthdays/community-birthdays.js",
  "./modules/seasonal/seasonal.css",
  "./modules/seasonal/seasonal.js",
  "./modules/year-review/year-review.css",
  "./modules/year-review/year-review.js",
  "./modules/birthday/birthday.js",
  "./modules/dashboard/dashboard.css",
  "./modules/month-archive/month-archive.css",
  "./modules/analysis/analysis.css",
  "./modules/wursti-walk/wursti-walk.css",
  "./modules/wursti-walk/wursti-walk.js",
  "./modules/merch/merch.css",
  "./modules/merch/merch.js",
  "./modules/pwa/pwa.css",
  "./modules/pwa/pwa.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith("wrc-app-") && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      const networkResponse = fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        });

      return cachedResponse || networkResponse;
    })
  );
});
