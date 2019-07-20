const version = "0.0.38";
const cacheName = `transportsg-${version}`;

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
            if (storedCacheName === cacheName || !storedCacheName.startsWith('transportsg')) return Promise.resolve();
            return caches.delete(storedCacheName).then(() => {
                console.log("Old cache " + storedCacheName + " deleted");
            });
        }))
    });

    e.waitUntil(
        cacheFiles([
            '/static/css/dropdown.css',
            '/static/css/all-features.css',
            '/static/css/index.css',
            '/static/css/style.css',
            '/static/css/search.css',
            '/static/css/loading.css',

            '/static/css/bus/stops/nearby.css',
            '/static/css/bus/lookup.css',
            '/static/css/bus/service.css',
            '/static/css/bus/timings-list.css',
            '/static/css/bus/timings.css',
            '/static/css/bus/candies.css',

            '/static/css/mrt/timings-result.css',
            '/static/css/mrt/timings.css',
            '/static/css/mrt/disruptions.css',
            '/static/css/mrt/stations/nearby.css',

            '/static/scripts/helper.js',
            '/static/scripts/search.js',
            '/static/scripts/unfolding-busstop.js',
            '/static/scripts/bookmarks.js',
            '/static/scripts/bookmark-helper.js',
            '/static/scripts/dropdown.js',
            '/static/scripts/header-magic.js',

            '/static/scripts/bus/stops/nearby.js',
            '/static/scripts/bus/lookup.js',
            '/static/scripts/bus/service.js',
            '/static/scripts/bus/timings.js',
            '/static/scripts/bus/candies.js',

            '/static/scripts/mrt/station-data.js',
            '/static/scripts/mrt/timings.js',
            '/static/scripts/mrt/stations/nearby.js',

            '/static/images/home/api-documentation.svg',
            '/static/images/home/bookmarks.svg',
            '/static/images/home/build.svg',
            '/static/images/home/bus_lookup.svg',
            '/static/images/home/contact_me.svg',
            '/static/images/home/everything_else.svg',
            '/static/images/home/general_search.svg',
            '/static/images/home/mrt_timings.svg',
            '/static/images/home/nearby_bus_stops.svg',
            '/static/images/home/nearby_nwabs.svg',
            '/static/images/home/server_stats.svg',

            '/static/images/bookmark/empty.svg',
            '/static/images/bookmark/filled.svg',

            '/static/images/service/dollar.svg',
            '/static/images/service/street-view.svg',
            '/static/images/service/timer.svg',

            '/static/images/free-bridging-bus-icon.svg',
            '/static/images/free-public-bus-icon.svg',
            '/static/images/bus-stop.svg',
            '/static/images/magnifying-glass.svg',
            '/static/images/non-wheelchair.svg',
            '/static/images/lrt-station.svg',
            '/static/images/wheelchair.svg',
            '/static/images/mrt-icon.svg',
            '/static/fonts/bree-serif.otf',
            '/static/fonts/ff-meta.otf',

            '/static/images/favicon192.png',
            '/static/images/favicon512.png',

            '/',
            '/bookmarks',
            '/nearby/mrt/stations',
            '/nearby/bus/stops',
            '/nearby/nwabs',
            '/timings/mrt',
            '/search',
            '/lookup'
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
