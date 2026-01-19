/**
 * Push Notifications Service
 * Handles Web Push subscription and management
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getToken = () => localStorage.getItem('alash_token');

export interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
}

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  console.log('Notification permission:', permission);
  return permission;
}

/**
 * Get the VAPID public key from the server
 */
export async function getVapidPublicKey(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE}/push/vapid-key`);
    if (!response.ok) {
      console.warn('Failed to get VAPID key:', response.statusText);
      return null;
    }
    const data = await response.json();
    return data.publicKey;
  } catch (error) {
    console.error('Error getting VAPID key:', error);
    return null;
  }
}

/**
 * Convert a base64 string to Uint8Array (for applicationServerKey)
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('Service Worker registered:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Get the current push subscription
 */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return subscription;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(): Promise<boolean> {
  if (!isPushSupported()) {
    console.warn('Push notifications not supported');
    return false;
  }

  try {
    // Request permission if needed
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return false;
    }

    // Get VAPID key
    const vapidKey = await getVapidPublicKey();
    if (!vapidKey) {
      console.error('VAPID key not available');
      return false;
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Subscribe to push
    const applicationKey = urlBase64ToUint8Array(vapidKey);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationKey.buffer,
    });

    console.log('Push subscription created:', subscription.endpoint);

    // Send subscription to server
    const token = getToken();
    const response = await fetch(`${API_BASE}/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
      }),
    });

    if (!response.ok) {
      console.error('Failed to save subscription on server');
      return false;
    }

    console.log('Push subscription saved on server');
    return true;
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    return false;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const subscription = await getCurrentSubscription();
    if (!subscription) {
      console.log('No active subscription');
      return true;
    }

    // Notify server
    const token = getToken();
    await fetch(`${API_BASE}/push/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
      }),
    });

    // Unsubscribe locally
    await subscription.unsubscribe();
    console.log('Unsubscribed from push');
    return true;
  } catch (error) {
    console.error('Failed to unsubscribe:', error);
    return false;
  }
}

/**
 * Send a test push notification (admin only)
 */
export async function sendTestPush(): Promise<boolean> {
  const token = getToken();
  try {
    const response = await fetch(`${API_BASE}/push/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Failed to send test push:', error);
    return false;
  }
}

/**
 * Get the current push notification state
 */
export async function getPushState(): Promise<PushNotificationState> {
  const isSupported = isPushSupported();
  const permission = getNotificationPermission();

  let isSubscribed = false;
  if (isSupported && permission === 'granted') {
    const subscription = await getCurrentSubscription();
    isSubscribed = !!subscription;
  }

  return {
    isSupported,
    permission,
    isSubscribed,
  };
}

/**
 * Initialize push notifications
 * Call this on app startup
 */
export async function initializePush(): Promise<void> {
  if (!isPushSupported()) {
    console.log('Push notifications not supported on this device');
    return;
  }

  // Register service worker
  await registerServiceWorker();

  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'NOTIFICATION_CLICK') {
      // Navigate to the URL from the notification
      const url = event.data.url;
      if (url && url !== window.location.pathname) {
        window.location.hash = url;
      }
    }
  });

  console.log('Push notifications initialized');
}
