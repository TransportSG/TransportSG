let express = require('express');
let router = new express.Router();

const BusStopTimings = require('./BusStopTimings');
const BusServiceTimings = require('./BusServiceTimings');

router.get('/timings/bus/:busService', BusServiceTimings);
router.get('/timings/:busStopCode', BusStopTimings);

module.exports = router;
