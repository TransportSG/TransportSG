let getBusTimings = require('../../timings/bus').getTimings;

module.exports = (req, res) => {
    let busStopCode = req.params.busStopCode;
    let busTimings = getBusTimings()[busStopCode];

    if (busTimings)
        res.json(busTimings);
    else
        res.json([]);
};
