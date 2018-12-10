const express = require('express');
let router = new express.Router();

let elveMagic = require('./elves_at_work');

let BusTimingsRouter = require('../../../routes/BusTimingsRouter');

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

    let parsed = elveMagic.resolveServices(elveMagic.parseQuery(query));

    if (parsed.services.allowed.length == 0) {
        res.render('templates/bus-timings-list', {busStopsData: {}, buses: {}});
        return;
    }

    let buses = elveMagic.filterBuses(parsed);

    loadBusStopsInfo(busStops, buses, busStopsData => {

        let promises = [];

        Object.keys(buses).forEach(busStopCode => {
            promises.push(new Promise(resolve => {
                BusTimingsRouter.loadBusStopData(busStops, busServices, buses[busStopCode], 0, (_, busTimings) => {
                    buses[busStopCode] = busTimings;
                    resolve();
                });
            }));
        });

        Promise.all(promises).then(() => {
            res.render('templates/bus-timings-list', {busStopsData, buses});
        });
    });
});

module.exports = router;
