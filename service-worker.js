'use strict';

const CACHE_NAME = 'coronapp-cache-v1';
const DATA_CACHE_NAME = 'coronapp-data-cache-v1';
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/js/main.js',
    '/images/icon-152.png',
    '/images/icon-192.png',
    '/images/icon-512.png',
    'https://use.fontawesome.com/releases/v5.13.0/js/all.js',
    'https://cdn.jsdelivr.net/npm/bulma@0.8.1/css/bulma.min.css',
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        }),
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(keys.map((key) => {
                if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        }),
    );
    self.clients.claim();
});

const isDataRequest = ({ request: { url } }) => (
    url.includes('corona.lmao.ninja') || url.includes('rawgithubusercontent')
);

const serveData = (e) => {
    const { request } = e;
    e.respondWith(
        caches.open(DATA_CACHE_NAME).then((cache) => {
            return fetch(request).then((response) => {
                const { status } = response;
                if (status === 200) {
                    cache.put(request.url, response.clone());
                }
                return response;
            }).catch((err) => {
                return cache.match(request);
            });
        }),
    );
};

const serveAppFiles = (e) => {
    const { request } = e;
    e.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(request).then((response) => {
                return response || fetch(request);   
            });
        }),
    );
};

self.addEventListener('fetch', (e) => {
    if (isDataRequest(e)) {
        serveData(e);
    } else {
        serveAppFiles(e);
    }
});
