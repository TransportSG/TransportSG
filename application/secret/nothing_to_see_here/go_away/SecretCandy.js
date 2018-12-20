const express = require('express');
let router = new express.Router();

let elfMagic = require('./elves_at_work');

let BusTimingsRouter = require('../../../routes/BusTimingsRouter');

require('./present_sleigh');

function isBusStopInRoute(svc, busStopCode) {
    return svc.stops.map(stop => stop.busStopCode == busStopCode).filter(Boolean).length !== 0;
}

function loadBusStopsInfo(busStops, buses, callback) {
    let busStopsData = {};

    let busStopCodes = Object.keys(buses);
    busStopCodes = busStopCodes.filter((busStopCode, i) => busStopCodes.indexOf(busStopCode) == i);

    let promises = [];

    busStopCodes.forEach(busStopCode => {
        promises.push(new Promise(resolve => {
            busStops.findDocument({
                busStopCode
            }, (err, busStop) => {
                busStopsData[busStopCode] = busStop;
                resolve();
            });
        }));
    });

    Promise.all(promises).then(() => {
        callback(busStopsData);
    });
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

    let services = {};
    let destinations = {};
    let directions = {};

    loadBusStopsInfo(busStops, buses, busStopsData => {

        let promises = [];

        Object.keys(buses).forEach(busStopCode => {
            promises.push(new Promise(resolve => {
                BusTimingsRouter.loadBusStopData(busStops, busServices, buses[busStopCode], 0, (_, svcs, dests) => {
                    services = Object.assign(services, svcs);
                    destinations = Object.assign(destinations, dests);
                    resolve();
                });
            }));
        });

        Promise.all(promises).then(() => {

            Object.values(services).forEach(service => {
                directions[service[0].fullService] = {};

                service.forEach(serviceDirection => {
                    Object.keys(buses).forEach(busStopCode => {
                        if (isBusStopInRoute(serviceDirection, busStopCode)) directions[serviceDirection.fullService][serviceDirection.routeDirection] = true;
                    });
                });
            });

            res.render('templates/bus-timings-list', {
                busStopsData,
                buses,
                services,
                destinations,
                directions
            });
        });
    });
});

module.exports = router;
