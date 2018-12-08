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

router.get('/:busStopCode', (req, res) => {
    let db = res.db;
    let busStops = db.getCollection('bus stops');
    let busServices = db.getCollection('bus services');

    let busStopCode = req.params.busStopCode
    let busTimings = getBusTimings()[busStopCode];

    let promises = [];

    if (!busTimings) {
        busTimings = [];
    }

    function e(s) {return s.match(/(\d+)/)[1]*1}

    busTimings = busTimings.sort((a, b) => e(a.service) - e(b.service));

    busTimings.forEach((busService, i) => {

        promises.push(new Promise(resolve => {
            busStops.findDocument({
                busStopCode: busService.destination
            }, (err, destinationBusStop) => {
                busTimings[i].destination = destinationBusStop;

                busServices.findDocument({
                    fullService: busService.service
                }, (err, busServiceData) => {
                    busTimings[i].service = busServiceData;

                    resolve();
                });
            });
        }));
    });

    Promise.all(promises).then(() => {
        busStops.findDocument({
            busStopCode
        }, (err, currentBusStop) => {
            res.render('bus/timings', {
                currentBusStop,
                busTimings
            });
        });
    });

});

module.exports = router;
