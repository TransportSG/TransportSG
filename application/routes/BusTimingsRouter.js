let express = require('express');
let router = new express.Router();

let getBusTimings = require('../timings/bus').getTimings;

function getServiceNumber(service) {
    if (service.startsWith('NR') || service.startsWith('CT')) {
        return service.slice(0, 2);
    } else
        return service.replace(/[A-Za-z#]/g, '');
}

function getServiceVariant(service) {
    if (service.startsWith('NR') || service.startsWith('CT')) {
        return service.slice(2);
    } else
        return service.replace(/[0-9]/g, '').replace(/#/, 'C');
}

function isBusStopInRoute(svc, busStopCode) {
    return svc.stops.map(stop => stop.busStopCode == busStopCode).filter(Boolean).length !== 0;
}

function getTimingsDifference(a, b) {let d = new Date(Math.abs(a - b));return {minutes: d.getUTCMinutes(),seconds: d.getUTCSeconds(),}};

function hasArrived(timing) {return +new Date() - +new Date(timing) > 0;}

function loadBusServicesFromTimings(busServices, busTimings, callback) {
    let svcs = busTimings.map(svc => svc.service);
    let flattened = svcs.reduce((a, b) => a.concat(b), []);
    let deduped = flattened.filter((element, index, array) => array.indexOf(element) === index);

    let services = {};
    let promises = [];

    deduped.forEach(serviceNum => {
        let dest = busTimings.filter(service => service.service === serviceNum)[0].destination;

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

function loadDestinationsFromTimings(busStops, busTimings, callback) {
    let destinations = {};

    let promises = [];

    busTimings.forEach(busService => {
        promises.push(new Promise(resolve => {
            let destBSC = busService.destination;

            if (destinations[destBSC]) resolve();
            else {
                busStops.findDocument({
                    busStopCode: destBSC
                }, (err, busStop) => {
                    destinations[destBSC] = busStop;
                    resolve();
                });
            }
        }));
    });

    Promise.all(promises).then(() => callback(destinations));
}

function loadBusStop(busStops, busStopCode, callback) {
    busStops.findDocument({
        busStopCode
    }, (err, busStop) => {
        callback(busStop);
    });
}

function renderTimings(req, res, next, viewFile) {
    let db = res.db;
    let busStops = db.getCollection('bus stops');
    let busServices = db.getCollection('bus services');

    let busStopCode = req.params.busStopCode
    let busTimings = getBusTimings()[busStopCode];

    if (!busTimings) {
        busTimings = [];
    }

    loadDestinationsFromTimings(busStops, busTimings, destinations => {
        loadBusServicesFromTimings(busServices, busTimings, services => {
            loadBusStop(busStops, busStopCode, currentBusStop => {
                if (currentBusStop) {
                    res.loggingData = currentBusStop.busStopName;
                    res.render(viewFile, {
                        currentBusStopCode: currentBusStop.busStopCode,
                        currentBusStop,
                        busTimings,
                        services,
                        destinations
                    });
                } else {
                    next();
                }
            });
        });
    });
}

router.get('/:busStopCode', (req, res, next) => {
    renderTimings(req, res, next, 'bus/timings');
});

router.get('/render-timings/:busStopCode', (req, res, next) => {
    renderTimings(req, res, next, 'templates/bus-timings');
});

module.exports = router;
module.exports = Object.assign(module.exports, {
    loadDestinationsFromTimings,
    loadBusServicesFromTimings,
    loadBusStop
})
