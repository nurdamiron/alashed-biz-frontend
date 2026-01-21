// ALASHED Business Service Worker
// Handles Push Notifications and Auto-Updates

// Version changes with each build - forces SW update
const SW_VERSION = Date.now().toString();
const CACHE_NAME = `alashed-cache-${SW_VERSION}`;

console.log('[SW] Service Worker version:', SW_VERSION);

// Install event - skip waiting immediately
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new version...');
  // Force immediate activation
  self.skipWaiting();
});

// Activate event - clean up ALL old caches and take control
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new version...');
  event.waitUntil(
    Promise.all([
      // Take control of all clients immediately
      self.clients.claim(),
      // Delete ALL old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
    ]).then(() => {
      // Notify all clients to reload
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_UPDATED', version: SW_VERSION });
        });
      });
    })
  );
});

// Fetch event - Network First strategy for all requests
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API and WebSocket requests
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/ws')) {
    return;
  }

  // Network First: Always try network, fall back to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache successful responses
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request);
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  let title = 'ALASHED Business';
  let body = 'Новое уведомление';
  let icon = '/icon-192x192.png';
  let tag = 'alashed-notification';
  let data = { url: '/' };

  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('[SW] Push payload:', JSON.stringify(payload));
      title = payload.title || title;
      body = payload.body || body;
      icon = payload.icon || icon;
      tag = payload.tag || tag;
      if (payload.data) {
        data = payload.data;
      }
    } catch (e) {
      console.error('[SW] Error parsing push data:', e);
      body = event.data.text() || body;
    }
  }

  const options = {
    body: body,
    icon: icon,
    tag: tag,
    data: data,
  };

  console.log('[SW] Showing notification:', title, options);

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log('[SW] Notification shown successfully'))
      .catch((err) => console.error('[SW] Failed to show notification:', err))
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  const path = event.notification.data?.url || '/';
  const baseUrl = self.location.origin;
  const hashUrl = `${baseUrl}/#${path}`;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'NOTIFICATION_CLICK', url: path });
          return client.focus();
        }
      }
      return clients.openWindow(hashUrl);
    })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed');
});

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: SW_VERSION });
  }
});

// Push subscription change event
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Push subscription changed');
  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: event.oldSubscription?.options?.applicationServerKey,
      })
      .then((subscription) => {
        return fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription }),
          credentials: 'include',
        });
      })
      .catch((error) => {
        console.error('[SW] Failed to re-subscribe:', error);
      })
  );
});

console.log('[SW] Service Worker loaded, version:', SW_VERSION);
