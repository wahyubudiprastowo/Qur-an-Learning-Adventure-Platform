// Service Worker for Cahaya Tahfiz Anak (PWA & Android Launcher Background Push)
const CACHE_NAME = 'tahfiz-anak-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable.png',
  '/data/quran.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // If local static asset or public data
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request)
          .then((response) => {
            if (response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() => cached);
      })
    );
  }
});

// =========================================================================
// 🔔 PWA & ANDROID LAUNCHER BACKGROUND PUSH NOTIFICATIONS
// =========================================================================

// Background Push Event (Handles server/web push even when app is closed on Android)
self.addEventListener('push', (event) => {
  let payload = {
    title: '⭐ Semangat Murojaah Hari Ini!',
    body: 'Assalamu\'alaikum! Waktunya mengulang hafalan Al-Qur\'an bersama Lumi ✨',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'cahaya-tahfiz-push',
    data: { url: '/', tab: 'tahfiz' },
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch {
      payload.body = event.data.text() || payload.body;
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon || '/icons/icon-192.png',
    badge: payload.badge || '/icons/icon-192.png',
    image: payload.image,
    vibrate: [200, 100, 200, 100, 200], // Distinctive pleasant vibration
    tag: payload.tag || 'cahaya-tahfiz-push',
    renotify: true,
    requireInteraction: true,
    data: payload.data || { url: '/' },
    actions: [
      { action: 'open_murojaah', title: '📖 Buka Murojaah' },
      { action: 'view_calendar', title: '📅 Cek Agenda Santri' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// Notification Click Handler (Works for Android App Launcher & Browser)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const notifData = event.notification.data || {};
  let targetPath = notifData.url || '/';

  if (action === 'view_calendar') {
    targetPath = '/#calendar';
  } else if (action === 'open_murojaah') {
    targetPath = '/#murojaah';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app window is already open, focus it and post message
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            action,
            data: notifData,
          });
          return client.focus();
        }
      }
      // Otherwise open new standalone window
      if (clients.openWindow) {
        return clients.openWindow(targetPath);
      }
    })
  );
});

// Message Listener for direct scheduling or service-worker-level triggers
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, {
      ...options,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [200, 100, 200],
    });
  }
});
