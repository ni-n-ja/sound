'use strict'

const SW_VERSION_UUID = '928d012e-6a3a-45bf-9f81-55002618c79d';

const now = new Date(Date.now());
const CACHE_NAME = now.getFullYear().toString() + "/" +
    (now.getMonth() + 1).toString() + "/" +
    (now.getDate()).toString() + "/" +
    (now.getHours()).toString() + ":" +
    (now.getMinutes()).toString() + ":" +
    (now.getSeconds()).toString();
const urlsToCache = [
    './index.html',
    './css/style.css',
    './js/web.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        }).then(skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        clients.claim().then(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                )
            })
        ));
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            } else {
                let fetchRequest = event.request.clone();
                return fetch(fetchRequest)
                    .then((response) => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        let responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        }).catch(e => {
                            console.error(e);
                        });
                        return response;
                    });
            }
        })
    );
})