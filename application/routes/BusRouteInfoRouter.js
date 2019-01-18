let express = require('express');
let router = new express.Router();

let getBusTimings = require('../timings/bus').getTimings;
let {resolveInterchanges} = require('./GeneralSearchRouter');

function getTimingsDifference(a, b) {let d = new Date(Math.abs(a - b));return {minutes: d.getUTCMinutes(),seconds: d.getUTCSeconds(),}};

let renderer = function (req, res, next) {
    let busServices = res.db.getCollection('bus services');
    let busStops = res.db.getCollection('bus stops');

    if (req.params.service.match(/[^\w]/)) {
        next();
        return;
    }

    let serviceSearch = new RegExp('^' + req.params.service + '$', 'i');

    busServices.findDocument({
        fullService: serviceSearch,
        routeDirection: (req.params.direction || 1) * 1
    }, (err, service) => {
        if (!service) {
            next();
            return;
        }

        busServices.countDocuments({fullService: serviceSearch}, (err, directionCount) => {
            resolveInterchanges([service], busServices, busStops, service => {
                service = service[0];
                res.render('bus/service', {service, timings: getBusTimings(), getTimingsDifference, directionCount});
            });
        });
    });
}

router.get('/streetview/:busStopCode', (req, res) => {
    res.db.getCollection('bus stops').findDocument({ busStopCode: req.params.busStopCode }, (err, busStop) => {
        let url = `https://www.google.com/maps?layer=c&cbll=${busStop.position.coordinates[1]},${busStop.position.coordinates[0]}`;
        res.end(url);
    });
})

router.get('/:service', renderer);

router.get('/:service/:direction', renderer);

module.exports = router;
