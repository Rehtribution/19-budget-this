const APP_PREFIX = 'BudgetThis-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
    './index.html',
    './css/style.css',
    './js/index.js',
    './js/idb.js',
    './manifest.json',
    './icons/icon-72x72.png',
    './icons/icon-96x96.png',
    './icons/icon-128x128.png',
    './icons/icon-144x144.png',
    './icons/icon-152x152.png',
    './icons/icon-192x192.png',
    './icons/icon-384x384.png',
    './icons/icon-512x512.png',
];

// Install the service worker
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('Your files were pre-cached successfully!');
            return cache.addAll(FILES_TO_CACHE);
        })
    )
});

// Activate the service worker and remove old data from the cache
self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log('Removing old cache data', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});
//different activate method
// self.addEventListener('activate', function (e) {
//     e.waitUntil(
//         caches.keys().then(function (keyList) {
//             let cacheKeeplist = keyList.filter(function (key) {
//                 return key.indexOf(APP_PREFIX);
//             });
//             cacheKeeplist.push(CACHE_NAME);

//             return Promise.all(keyList.map(function (key, i) {
//                 if (cacheKeeplist.indexOf(key) === -1) {
//                     console.log('deleting cache : ' + keyList[i] );
//                     return caches.delete(keyList[i]);
//                 }
//             }));
//         })
//     )
// });

// Respond with cached resources
self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url)
    e.respondWith(
        caches.match(e.request).then(function (request) {
            if (request) { // if cache is available, respond with cache
                console.log('responding with cache : ' + e.request.url)
                return request
            } else {       // if there are no cache, try fetching request
                console.log('file is not cached, fetching : ' + e.request.url)
                return fetch(e.request)
            }
        })
    )
});

