let express = require('express');
let router = new express.Router();

const BusStopsNearbyRouter = require('./nearby/BusStopsNearbyRouter');
const NWABsNearbyRouter = require('./nearby/NWABsNearbyRouter');

router.use('/bus/stops', BusStopsNearbyRouter);
router.use('/nwabs', NWABsNearbyRouter);

module.exports = router;
