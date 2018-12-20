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

function loadBusStopData(busStops, busServices, busTimings, currentBusStopCode, callback) {

    let svcs = busTimings.map(svc => svc.service);
    let flattened = svcs.reduce((a, b) => a.concat(b), []);
    let deduped = flattened.filter((element, index, array) => array.indexOf(element) === index);

    let services = {};
    let destinations = {};

    let promises = [];

    deduped.forEach(service => {
        promises.push(new Promise(resolve => {
            busServices.findDocuments({
                fullService: service
            }).toArray((err, serviceDirections) => {
                services[service] = serviceDirections.sort((a,b)=>a.routeDirection - b.routeDirection);
                resolve();
            });
        }));
    });

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

    Promise.all(promises).then(() => {
        if (currentBusStopCode)
            busStops.findDocument({
                busStopCode: currentBusStopCode
            }, (err, currentBusStop) => {
                callback(currentBusStop, services, destinations);
            });
        else
            callback(null, services, destinations);
    });
}

router.get('/:busStopCode', (req, res) => {
    let db = res.db;
    let busStops = db.getCollection('bus stops');
    let busServices = db.getCollection('bus services');

    let busStopCode = req.params.busStopCode
    let busTimings = getBusTimings()[busStopCode];

    if (!busTimings) {
        busTimings = [];
    }

    function e(s) {
        let numberPart = s.match(/(\d+)/)[1]*1;
        let letterPart = s.match(/(\w+)/)[1];
        letterPart = [...letterPart].map(e=>e.charCodeAt(0)).reduce((a, b) => a + b, '');

        return parseFloat(numberPart + '.' + letterPart);
    }

    busTimings = busTimings.sort((a, b) => e(a.service) - e(b.service));

    loadBusStopData(busStops, busServices, busTimings, busStopCode, (currentBusStop, services, destinations) => {
        res.render('bus/timings', {
            currentBusStop,
            busTimings,
            services,
            destinations
        });
    });
});

router.loadBusStopData = loadBusStopData;

module.exports = router;
