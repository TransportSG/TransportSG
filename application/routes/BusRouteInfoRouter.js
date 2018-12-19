let express = require('express');
let router = new express.Router();

let getBusTimings = require('../timings/bus').getTimings;
let {resolveInterchanges} = require('./GeneralSearchRouter');

router.get('/:service', (req, res) => {
    let busServices = res.db.getCollection('bus services');
    let busStops = res.db.getCollection('bus stops');
    busServices.findDocument({
        fullService: req.params.service
    }, (err, service) => {
        resolveInterchanges([service], busServices, busStops, service => {
            service = service[0];
            res.render('bus/service', {service});
        });
    });
});

module.exports = router;
