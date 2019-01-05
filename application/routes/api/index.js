let express = require('express');
let router = new express.Router();

const BusStopTimings = require('./BusStopTimings');
const BusServiceTimings = require('./BusServiceTimings');
const BusService = require('./BusService');
const BusStop = require('./BusStop');

router.get('/timings/bus/:busService', BusServiceTimings);
router.get('/timings/:busStopCode', BusStopTimings);

router.get('/bus/services', BusService.getAllBusServices);
router.get('/bus/stops', BusStop.getAllBusStops);
router.get('/bus/stops/many/:busStopCodes', BusStop.getManyBusStops);
router.get('/bus/stops/:busStopCode', BusStop.getBusStop);

router.get('/bus/:busService', BusService.getBusService);

module.exports = router;
