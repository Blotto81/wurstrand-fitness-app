const CACHE_NAME = "wrc-app-v51";
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
  "./player-assets/thorsten.png",
  "./player-assets/basti.png",
  "./player-assets/marian-gomesch.png",
  "./player-assets/fabi.png",
  "./merch-assets/wrc-performance-hoodie.webp",
  "./merch-assets/bertha-bohne-plueschtier.webp",
  "./merch-assets/wrc-trinkflasche.webp",
  "./merch-assets/ich-haette-gewonnen-pokal.webp",
  "./merch-assets/marians-meistertorte.webp",
  "./merch-assets/anti-ausreden-spray.webp",
  "./merch-assets/wrc-duftbaum.webp",
  "./merch-assets/wrc-energy-drink.webp",
  "./merch-assets/wrc-power-socken.webp",
  "./merch-assets/wursti-di-pizza-kochbuch.webp",
  "./merch-assets/wrc-mystery-box.webp",
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
  "./modules/dart-stats/dart-stats.css",
  "./modules/dart-stats/dart-stats.js",
  "./modules/dart-caller/dart-caller.css",
  "./modules/dart-caller/dart-caller-audio.js",
  "./modules/dart-caller/dart-caller.js",
  "./modules/dart-caller/dart-cricket.css",
  "./modules/dart-caller/dart-cricket.js",
  "./modules/frisbee/frisbee.css",
  "./modules/frisbee/frisbee.js",
  "./modules/uno/uno.css",
  "./modules/uno/uno.js",
  "./modules/table-tennis/table-tennis.css",
  "./modules/table-tennis/table-tennis.js",
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
  "./modules/pwa/pwa.js",
  "./modules/clubs/clubs.css",
  "./modules/clubs/clubs.js"
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

  const isCodeAsset = ["script", "style"].includes(request.destination)
    || /\.(?:js|css)$/.test(requestUrl.pathname);

  if (isCodeAsset) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request))
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
