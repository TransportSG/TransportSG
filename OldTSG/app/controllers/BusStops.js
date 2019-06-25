const BusStopsModel = require('../models/BusStopsModel');

exports.busStops = (req, res) => {
    res.render('bus/stops');
};

exports.queryBusStop = (req, res) => {
    BusStopsModel.findBusStop(req.params.busStopCode, busStop => {
        res.render('bus/stop-info', {
            busStop: busStop
        });
    });
};

exports.busStopFinder = (req, res) => {
    res.render('bus/locate-stop', {
        csrf: req.csrfToken()
    });
};

exports.queryBusStops = (req, res) => {
    var coords = req.body.coords;
    BusStopsModel.findBusStopsFromLatLong(coords, (err, busStops) => {
        if (!busStops) res.status(500).end();
        else {
            if (busStops.length !== 0)
                res.json({
                    busStops: busStops
                });
            else res.status(400).json({
                error: 'NoBusStopFound'
            });
        }
    });
};
