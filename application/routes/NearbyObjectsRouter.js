let express = require('express');
let router = new express.Router();

const BusStopsNearbyRouter = require('./nearby/BusStopsNearbyRouter');

router.use('/bus/stops', BusStopsNearbyRouter);

module.exports = router;
