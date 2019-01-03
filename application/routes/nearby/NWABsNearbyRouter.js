let express = require('express');
let router = new express.Router();

let getBusTimings = require('../../timings/bus').getTimings;
let BusTimingsRouter = require('../BusTimingsRouter');
let {findNearbyBusStops} = require('./BusStopsNearbyRouter');

let {filterBuses, parseQuery, resolveServices} = require('../../secret/nothing_to_see_here/go_away/elves_at_work.js');

router.get('/', (req, res) => {
    res.render('nwabs/nearby');
});

function filterNearbyBusStops(foundBusStops, busTimings) {
    let filtered = {};

    foundBusStops.forEach(busStopInfo => {
        let {busStopCode} = busStopInfo;
        filtered[busStopCode] = busTimings[busStopCode] || [];
    });

    return filtered;
}

function filterNWABs(busTimings) {
    return filterBuses(resolveServices(parseQuery('nwab')), busTimings);
}

function resolveMultipleBusStops(busStops, busServices, allBusTimings, callback) {

    let allServices = {},
        allBusStops = {};

    let promises = [];

    Object.keys(allBusTimings).forEach(busStopCode => {
        let busTimings = allBusTimings[busStopCode];
        promises.push(new Promise(resolve => {
            BusTimingsRouter.loadDestinationsFromTimings(busStops, busTimings, destinations => {
                BusTimingsRouter.loadBusServicesFromTimings(busServices, busTimings, services => {
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
    let busStops = res.db.getCollection('bus stops');
    let busServices = res.db.getCollection('bus services');
    let busTimings = getBusTimings();

    findNearbyBusStops(busStops, req.body, (err, foundBusStops) => {
        let nearbyBusTimings = filterNearbyBusStops(foundBusStops, busTimings);
        let nearbyNWABs = filterNWABs(nearbyBusTimings);
        resolveMultipleBusStops(busStops, busServices, nearbyNWABs, (services, busStops) => {
            res.render('templates/bus-timings-list-old', {
                services,
                busStops,
                buses: nearbyNWABs
            });
        });

    })
});

module.exports = router;
module.exports.resolveMultipleBusStops = resolveMultipleBusStops;
