
const CACHE_NAME = 'study-timer-pwa-v1';
const urlsToCache = [
    '/ST/',
    '/ST/index.html',
    '/ST/style.css',
    '/ST/app.js',
    '/ST/manifest.json',
    '/ST/icons/icon-72x72.png',
    '/ST/icons/icon-96x96.png',
    '/ST/icons/icon-128x128.png',
    '/ST/icons/icon-144x144.png',
    '/ST/icons/icon-152x152.png',
    '/ST/icons/icon-192x192.png',
    '/ST/icons/icon-384x384.png',
    '/ST/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

