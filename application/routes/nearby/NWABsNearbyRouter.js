let express = require('express');
let router = new express.Router();

let getBusTimings = require('../../timings/bus').getTimings;
let BusTimingsRouter = require('../BusTimingsRouter');

function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 +
          c(lat1 * p) * c(lat2 * p) *
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

function findNearbyBusStops(busStops, position, callback) {
    let maxDiff = 0.004;
    let {latitude, longitude} = position;

    busStops.findDocuments({
        'position.latitude': {
            $gt: latitude - maxDiff,
            $lt: latitude + maxDiff
        },
        'position.longitude': {
            $gt: longitude - maxDiff,
            $lt: longitude + maxDiff
        }
    }).toArray(callback);
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

function isBusStopInRoute(svc, busStopCode) {
    return svc.stops.map(stop => stop.busStopCode == busStopCode).filter(Boolean).length !== 0;
}


router.get('/', (req, res) => {
    res.render('nwabs/nearby');
});

router.post('/', (req, res) => {
    let busStops = res.db.getCollection('bus stops');
    let busServices = res.db.getCollection('bus services');
    let timings = getBusTimings();

    let buses = {};

    findNearbyBusStops(busStops, req.body, (err, foundBusStops) => {
        foundBusStops.forEach(busStop => {
            let {busStopCode} = busStop;
            if (!timings[busStopCode]) return;

            let filtered = timings[busStopCode].map(svc => {
                svc.timings = svc.timings.filter(bus => !bus.isWAB);
                return svc;
            }).filter(svc => svc.timings.length);

            if (filtered.length > 0) buses[busStopCode] = filtered;
        });

        let services = {};
        let destinations = {};
        let directions = {};

        loadBusStopsInfo(busStops, buses, busStopsData => {

            let promises = [];

            Object.keys(buses).forEach(busStopCode => {
                promises.push(new Promise(resolve => {
                    BusTimingsRouter.loadBusStopData(busStops, busServices, buses[busStopCode], 0, (_   , svcs, dests) => {
                        services = Object.assign(services, svcs);
                        destinations = Object.assign(destinations, dests);
                        resolve();
                    });
                }));
            });

            Promise.all(promises).then(() => {

                res.render('templates/bus-timings-list-old', {
                    busStopsData,
                    buses,
                    services,
                    destinations,
                });
            });
        });

    })
});

module.exports = router;
