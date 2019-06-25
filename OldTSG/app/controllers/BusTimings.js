const BusTimingsModel = require('../models/BusTimingsModel'),
        prettySeconds = require('../utils/pretty-seconds'),
        dateFormat = require('dateformat');

exports.busTimings = (req, res) => {
    res.render('bus/timings');
};

exports.busTimingBlock = (req, res) => {
    BusTimingsModel.getBusStopTimings(req.params.busStop, (err, timings) => {
        res.render('bus/timings-box', {
            stop: req.params.busStop,
            timings: timings,
            prettySeconds: prettySeconds,
            dateFormat: dateFormat
        });
    });
}
