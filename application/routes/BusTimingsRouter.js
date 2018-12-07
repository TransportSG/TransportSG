let express = require('express');
let router = new express.Router();

let getBusTimings = require('../timings/bus').getTimings;

router.get('/:busStopCode', (req, res) => {
    res.json(getBusTimings()[req.params.busStopCode]);
    res.end();
});

module.exports = router;
