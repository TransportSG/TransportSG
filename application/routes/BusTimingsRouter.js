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

function getTimingsDifference(a, b) {let d = new Date(Math.abs(a - b));return {minutes: d.getUTCMinutes(),seconds: d.getUTCSeconds(),}};

function hasArrived(timing) {return +new Date() - +new Date(timing) > 0;}

function loadBusStopData(busStops, busServices, busTimings, currentBusStopCode, callback) {
    let promises = [];

    busTimings.forEach((busService, i) => {
        promises.push(new Promise(resolve => {
            busStops.findDocument({
                busStopCode: busService.destination
            }, (err, destinationBusStop) => {
                busTimings[i].destination = destinationBusStop;

                busServices.findDocument({
                    fullService: busService.service
                }, (err, busServiceData) => {
                    if (busServiceData) {
                        busTimings[i].service = busServiceData

                        resolve();
                    } else {
                        busServices.findDocument({
                            fullService: getServiceNumber(busService.service)
                        }, (err, busServiceData) => {
                            if (busServiceData) {
                                busServiceData.variant = getServiceVariant(busService.service);

                                busTimings[i].service = busServiceData

                                resolve();
                            }
                        });
                    }
                });
            });
        }));
    });

    Promise.all(promises).then(() => {
        if (currentBusStopCode)
            busStops.findDocument({
                busStopCode: currentBusStopCode
            }, (err, currentBusStop) => {
                callback(currentBusStop, busTimings);
            });
        else
            callback(null, busTimings);
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

    loadBusStopData(busStops, busServices, busTimings, busStopCode, (currentBusStop, busTimings) => {
        res.render('bus/timings', {
            currentBusStop,
            busTimings
        });
    });
});

router.loadBusStopData = loadBusStopData;

module.exports = router;
