let express = require('express');
let router = new express.Router();

const BusStopTimings = require('./BusStopTimings');

router.get('/timings/:busStopCode', BusStopTimings);

module.exports = router;
