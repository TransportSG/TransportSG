const version = "0.0.1";
const cacheName = `bus.transportsg-${version}`;

function cacheFiles(files) {
    return caches.open(cacheName).then(cache => {
        return cache.addAll(files).then(() => self.skipWaiting());
    });
}

self.addEventListener('install', e => {
    const timeStamp = Date.now();
    e.waitUntil(
        cacheFiles([
            // '/static/css/style.css',

            // '/static/css/bus/lookup.css',
            // '/static/css/bus/dropdown.css',
            // '/static/css/bus/loading.css',
            //
            // '/static/scripts/helper.js',
            // '/static/scripts/dropdown.js',
            //
            // '/static/scripts/bus/lookup.js',
            //
            // '/static/fonts/bree-serif.otf',

            '/',
        ].map(url => {
            return url.startsWith('/static/') ? 'https://static.transportsg.me' + url : url;
        })).then(() => {
            return self.skipWaiting();
        })
    );
});

function findStaticFile(url) {
    let file = 'https://static.transportsg.me' + url.match(/(\/static.+)$/)[1];

    return caches.open(cacheName)
        .then(cache => cache.match(file, {ignoreSearch: true}))
        .then(response => {
            return response || fetch(file);
        })
}

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    if (event.request.method != 'GET') return;
    let {url} = event.request;

    if (url.includes('/static/'))
        event.respondWith(
            findStaticFile(url)
        );
    else
        event.respondWith(
            caches.open(cacheName)
            .then(cache => cache.match(event.request, {ignoreSearch: true}))
            .then(response => {
                return response || fetch(event.request);
            })
        );
});
