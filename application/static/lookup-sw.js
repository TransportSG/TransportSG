const version = "0.0.5";
const cacheName = `bus.transportsg-${version}`;

function cacheFiles(files) {
    return caches.open(cacheName).then(cache => {
        return cache.addAll(files).then(() => self.skipWaiting())
            .catch(e => {
                console.error(e);
                return '';
            });
    });
}

self.addEventListener('install', e => {
    const timeStamp = Date.now();

    caches.keys().then(function (cachesNames) {
        return Promise.all(cachesNames.map((storedCacheName) => {
            if (storedCacheName === cacheName || !storedCacheName.startsWith('bus.transportsg')) return Promise.resolve();
            return caches.delete(storedCacheName).then(() => {
                console.log("Old cache " + storedCacheName + " deleted");
            });
        }))
    });

    e.waitUntil(
        cacheFiles([
            '/static/css/style.css',
            '/static/css/dropdown.css',
            '/static/css/loading.css',

            '/static/css/bus/lookup.css',

            '/static/scripts/helper.js',
            '/static/scripts/dropdown.js',
            '/static/scripts/bus/lookup.js',

            '/static/fonts/bree-serif.otf',

            '/static/images/lookup-favicon192.png',
            '/static/images/lookup-favicon512.png',

            '/',
        ])
    );
});


self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    if (event.request.method != 'GET') return;

    event.respondWith(
        caches.open(cacheName)
        .then(cache => cache.match(event.request, {ignoreSearch: true}))
        .then(response => {
            return response || fetch(event.request);
        })
    );
});
