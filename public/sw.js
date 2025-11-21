// public/sw.js
/**
 * =============================================================================
 * Service Worker - PWA Support
 * =============================================================================
 * Enables offline viewing and caching for MoviesNow
 */

const CACHE_NAME = "moviesnow-v1";
const OFFLINE_URL = "/offline";

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/home",
  "/offline",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching static assets");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip API calls (let them go to network)
  if (request.url.includes("/api/")) {
    return;
  }

  // Skip video streams (too large to cache)
  if (
    request.url.includes(".m3u8") ||
    request.url.includes(".ts") ||
    request.url.includes(".mp4")
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version
        return cachedResponse;
      }

      // Clone the request
      const fetchRequest = request.clone();

      return fetch(fetchRequest)
        .then((response) => {
          // Check if valid response
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache images and static assets
          if (
            request.destination === "image" ||
            request.destination === "style" ||
            request.destination === "script"
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }

          return response;
        })
        .catch(() => {
          // Network failed, try to return offline page
          if (request.destination === "document") {
            return caches.match(OFFLINE_URL);
          }
        });
    })
  );
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag);

  if (event.tag === "sync-watchlist") {
    event.waitUntil(syncWatchlist());
  }

  if (event.tag === "sync-progress") {
    event.waitUntil(syncProgress());
  }
});

async function syncWatchlist() {
  // TODO: Implement watchlist sync
  console.log("[SW] Syncing watchlist");
}

async function syncProgress() {
  // TODO: Implement progress sync
  console.log("[SW] Syncing playback progress");
}

// Push notifications
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received");

  const data = event.data ? event.data.json() : {};
  const title = data.title || "MoviesNow";
  const options = {
    body: data.body || "New content available",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: data.tag || "default",
    data: data.url || "/home",
    actions: [
      {
        action: "open",
        title: "Watch Now",
      },
      {
        action: "close",
        title: "Close",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked");

  event.notification.close();

  if (event.action === "open" || !event.action) {
    const url = event.notification.data || "/home";

    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          // Check if there's already a window open
          for (const client of clientList) {
            if (client.url === url && "focus" in client) {
              return client.focus();
            }
          }

          // Open new window
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
});

// Message handling
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data);

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data.type === "CACHE_DOWNLOAD") {
    const { url, id } = event.data;
    cacheDownload(url, id).then(() => {
      event.ports[0].postMessage({ type: "CACHE_COMPLETE", id });
    });
  }
});

async function cacheDownload(url, id) {
  console.log("[SW] Caching download:", id);
  const cache = await caches.open("downloads-v1");
  const response = await fetch(url);
  await cache.put(url, response);
}
