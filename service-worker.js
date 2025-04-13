const CACHE_NAME = 'my-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/bgvid.mp4',
  '/media/logo.png',
  '/media/madwoman.png'
];

// Install event: cache essential resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => console.error('[Service Worker] Failed to cache files:', error))
  );
  self.skipWaiting(); // Activate the new service worker immediately
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
  self.clients.claim(); // Take control of all clients immediately
});

// Fetch event: serve from cache first, then network fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .catch(() => {
            // Optional: Return a fallback page or image when offline
            // return caches.match('/offline.html');
          });
      })
  );
});

// Background Sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tag-example') {
    console.log('[Service Worker] Background Sync triggered');
    event.waitUntil(doSomeBackgroundTask());
  }
});

// Example background task
async function doSomeBackgroundTask() {
  console.log('Doing background task...');
  // Example: Sync pending requests to server
  // You can implement IndexedDB to store offline requests
}

// Push Notification event
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received.');
  let data = { title: 'Default Title', message: 'Default message' };

  if (event.data) {
    data = event.data.json();
  }

  const title = data.title;
  const options = {
    body: data.message,
    icon: '/icons/icon-192x192.png', // Updated with your cached icon
    badge: '/icons/icon-192x192.png', // Updated with your cached icon
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Optional: Handle notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/') // Open homepage or any specific page
  );
});
