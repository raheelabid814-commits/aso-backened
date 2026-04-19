/* CH Restaurant Service Worker - PWA & Push Notifications */
const CACHE_NAME = 'ch-restaurant-v3';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/assets/logo.png'
];

// Install: Cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS).catch(() => {}))
    );
    self.skipWaiting();
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});

// Push Notification Handler (KFC/WhatsApp style)
self.addEventListener('push', (event) => {
    let data = { title: 'CH Restaurant', body: 'You have a new update!' };
    try { data = event.data.json(); } catch(e) {}

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/assets/logo.png',
            badge: '/assets/logo.png',
            vibrate: [200, 100, 200],
            tag: data.tag || 'ch-notif',
            renotify: true,
            data: { url: data.url || '/' },
            actions: data.actions || []
        })
    );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow('/');
        })
    );
});
