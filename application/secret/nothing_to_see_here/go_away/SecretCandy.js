const express = require('express');
let router = new express.Router();

let elfMagic = require('./elves_at_work');

let BusTimingsRouter = require('../../../routes/BusTimingsRouter');
let NWABsNearbyRouter = require('../../../routes/nearby/NWABsNearbyRouter');

require('./present_sleigh');

function isBusStopInRoute(svc, busStopCode) {
    return svc.stops.map(stop => stop.busStopCode == busStopCode).filter(Boolean).length !== 0;
}

router.get('/', (req, res) => {
    res.render('secret/candies');
});

router.post('/', (req, res) => {
    let {query} = req.body;

    if (!query) {
        res.status(400).end();
    }

    let db = res.db;
    let busStops = db.getCollection('bus stops');
    let busServices = db.getCollection('bus services');

    let parsed = elfMagic.resolveServices(elfMagic.parseQuery(query));

    if (parsed.services.allowed.length == 0) {
        res.render('templates/bus-timings-list', {busStopsData: {}, buses: {}});
        return;
    }

    let buses = elfMagic.filterBuses(parsed);

    NWABsNearbyRouter.resolveMultipleBusStops(busStops, busServices, buses, (services, busStops) => {
        res.render('templates/bus-timings-list-old', {
            services,
            busStops,
            buses
        });
    });

});

module.exports = router;
