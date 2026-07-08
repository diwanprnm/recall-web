/**
 * Recall Service Worker
 *
 * Handles:
 *   1. Push notifications (future)
 *   2. Network-first resource caching (offline-friendly shell)
 *   3. Push event for "Daily Digest" reminders
 *
 * For MVP this is a minimal implementation. Later we can add background
 * sync, periodic sync, etc.
 */

/* eslint-disable */

const CACHE_NAME = "recall-shell-v1";
const PRECACHE_URLS = ["/", "/dashboard", "/offline.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Don't block install on pre-cache failures — just try
      return Promise.allSettled(
        PRECACHE_URLS.map((url) => cache.add(url).catch(() => null))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/**
 * Network-first strategy for HTML & API requests
 * - Try network, fall back to cache when offline
 * - For static assets: cache-first
 */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and cross-origin requests
  if (event.request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  // Skip API requests from being cached (we want fresh data)
  if (url.pathname.startsWith("/api/")) return;

  // For navigations (HTML): network-first
  if (event.request.mode === "navigate" || event.request.destination === "document") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful page responses
          if (response.ok) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          }
          return response;
        })
        .catch(() =>
          // Offline fallback
          caches.match("/offline.html").then((cached) => cached || caches.match("/"))
        )
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok && url.pathname.startsWith("/icons/")) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
        }
        return response;
      });
    })
  );
});

/* ── Push notifications scaffold (for Daily Digest later) ─────────────── */
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch (e) {
    payload = { title: "Recall", body: event.data.text() };
  }

  const options = {
    body: payload.body || "",
    icon: payload.icon || "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    vibrate: [100, 50, 100],
    data: {
      url: payload.url || "/dashboard",
      timestamp: Date.now(),
    },
    actions: [
      { action: "open", title: "Open Recall" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || "Recall", options)
  );
});

/* ── Notification click → open the URL ───────────────────────────────── */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing tab if it's the same origin
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Fall back to opening new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});