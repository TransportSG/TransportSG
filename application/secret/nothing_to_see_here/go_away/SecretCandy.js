const express = require('express');
let router = new express.Router();

let elfMagic = require('./elves_at_work');

let BusTimingsRouter = require('../../../routes/BusTimingsRouter');
require('./present_sleigh');

function isBusStopInRoute(svc, busStopCode) {
    return svc.stops.map(stop => stop.busStopCode == busStopCode).filter(Boolean).length !== 0;
}

router.get('/', (req, res) => {
    res.render('secret/candies');
});

function loadBusServicesFromTimings(busServices, busTimings, callback) {
    let svcs = busTimings.map(svc => svc.service);
    let flattened = svcs.reduce((a, b) => a.concat(b), []);
    let deduped = flattened.filter((element, index, array) => array.indexOf(element) === index);

    let services = {};
    let promises = [];

    deduped.forEach(serviceNum => {
        promises.push(new Promise(resolve => {
            busServices.findDocuments({
                fullService: serviceNum
            }).toArray((err, service) => {
                services[serviceNum] = service;
                resolve();
            });
        }));
    });

    Promise.all(promises).then(() => callback(services))
}

function resolveMultipleBusStops(busStops, busServices, allBusTimings, callback) {

    let allServices = {},
        allBusStops = {};

    let promises = [];

    Object.keys(allBusTimings).forEach(busStopCode => {
        let busTimings = allBusTimings[busStopCode];
        promises.push(new Promise(resolve => {
            BusTimingsRouter.loadDestinationsFromTimings(busStops, busTimings, destinations => {
                loadBusServicesFromTimings(busServices, busTimings, services => {
                    BusTimingsRouter.loadBusStop(busStops, busStopCode, busStopInfo => {
                        allBusStops = Object.assign(allBusStops, destinations);
                        allServices = Object.assign(allServices, services);

                        allBusStops[busStopCode] = busStopInfo;

                        resolve();
                    });
                });
            });
        }));
    });

    Promise.all(promises).then(() => {
        callback(allServices, allBusStops);
    });
}

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
        res.render('templates/bus-timings-list', {busStopsData: {}, buses: {}, services: {}});
        return;
    }

    let buses = elfMagic.filterBuses(parsed);

    resolveMultipleBusStops(busStops, busServices, buses, (services, busStops) => {
        res.render('templates/bus-timings-list', {
            services,
            busStops,
            buses
        });
    });

});

module.exports = router;
