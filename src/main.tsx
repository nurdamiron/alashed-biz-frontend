import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

// Register Service Worker and handle updates
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('[App] SW registered:', registration.scope);

      // Check for updates periodically (every 5 minutes)
      setInterval(() => {
        registration.update();
      }, 5 * 60 * 1000);

      // Check for updates when app becomes visible
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update();
        }
      });
    }).catch((error) => {
      console.error('[App] SW registration failed:', error);
    });

    // Listen for SW update messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        console.log('[App] New version available:', event.data.version);
        // Auto-reload to get the latest version
        window.location.reload();
      }
    });

    // Handle controller change (new SW took over)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[App] New SW controller, reloading...');
      window.location.reload();
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
