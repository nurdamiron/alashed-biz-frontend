// ALASHED Business Service Worker
// Handles Push Notifications and Caching

const CACHE_NAME = 'alashed-v1';
const OFFLINE_URL = '/offline.html';

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    Promise.all([
      // Take control of all clients immediately
      self.clients.claim(),
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      }),
    ])
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  let data = {
    title: 'ALASHED Business',
    body: 'Новое уведомление',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'default',
    data: { url: '/' },
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = {
        title: payload.title || data.title,
        body: payload.body || data.body,
        icon: payload.icon || data.icon,
        badge: payload.badge || data.badge,
        tag: payload.tag || data.tag,
        data: payload.data || data.data,
      };
    } catch (e) {
      console.error('[SW] Error parsing push data:', e);
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: data.data,
    vibrate: [100, 50, 100],
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'Открыть' },
      { action: 'close', title: 'Закрыть' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Get the URL to open
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to find an existing window/tab
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Navigate existing client to the URL
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            url: urlToOpen,
          });
          return client.focus();
        }
      }

      // No existing window found, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event);
});

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push subscription change event
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Push subscription changed');

  event.waitUntil(
    // Re-subscribe with the new subscription
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: event.oldSubscription?.options?.applicationServerKey,
      })
      .then((subscription) => {
        // Send new subscription to server
        return fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ subscription }),
          credentials: 'include',
        });
      })
      .catch((error) => {
        console.error('[SW] Failed to re-subscribe:', error);
      })
  );
});

console.log('[SW] Service Worker loaded');
