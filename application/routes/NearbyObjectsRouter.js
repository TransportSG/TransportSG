let express = require('express');
let router = new express.Router();

const BusStopsNearbyRouter = require('./nearby/BusStopsNearbyRouter');
const NWABsNearbyRouter = require('./nearby/NWABsNearbyRouter');
const MRTStationsNearbyRouter = require('./nearby/MRTStationsNearbyRouter');

router.use('/bus/stops', BusStopsNearbyRouter);
router.use('/nwabs', NWABsNearbyRouter);
router.use('/mrt/stations', MRTStationsNearbyRouter);

module.exports = router;
