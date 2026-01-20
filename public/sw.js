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
// iOS-compatible: minimal options, no actions/vibrate
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

  // iOS-compatible notification options (minimal)
  const options = {
    body: body,
    icon: icon,
    tag: tag,
    data: data,
    // Note: badge, actions, vibrate, requireInteraction are NOT supported on iOS Safari
  };

  console.log('[SW] Showing notification:', title, options);

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log('[SW] Notification shown successfully'))
      .catch((err) => console.error('[SW] Failed to show notification:', err))
  );
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');

  event.notification.close();

  // Get the URL to open
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      console.log('[SW] Found', clientList.length, 'client(s)');

      // Try to find an existing window/tab
      for (const client of clientList) {
        if ('focus' in client) {
          console.log('[SW] Focusing existing client');
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            url: urlToOpen,
          });
          return client.focus();
        }
      }

      // No existing window found, open a new one
      console.log('[SW] Opening new window:', urlToOpen);
      return clients.openWindow(urlToOpen);
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
