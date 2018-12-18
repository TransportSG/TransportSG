let express = require('express');
let router = new express.Router();

let getBusTimings = require('../../timings/bus').getTimings;
let BusTimingsRouter = require('../BusTimingsRouter');

const elfMagic = require('../../secret/nothing_to_see_here/go_away/elves_at_work');

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


router.get('/', (req, res) => {
    res.render('nwabs/nearby');
});

router.post('/', (req, res) => {
    let busStops = res.db.getCollection('bus stops');
    let busServices = res.db.getCollection('bus services');
    let timings = getBusTimings();

    let allowedBusStops = {};

    findNearbyBusStops(busStops, req.body, (err, foundBusStops) => {
        foundBusStops.forEach(busStop => {
            let {busStopCode} = busStop;

            allowedBusStops[busStopCode] = timings[busStopCode];
        })

        let buses = elfMagic.filterBuses(elfMagic.resolveServices(elfMagic.parseQuery('nwab')), allowedBusStops);

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

    })
});

module.exports = router;
