let getBusTimings = require('../../timings/bus').getTimings;

module.exports = (req, res) => {
    let busServices = res.db.getCollection('bus services');

    busServices.findDocuments({
        fullService: req.params.busService,
        stops: { $exists: true }
    }).toArray((err, serviceDirections) => {
        if (!serviceDirections.length) {
            res.status(404).json({
                error: 'No such bus service'
            })
            return;
        }

        let busTimings = getBusTimings();
        let timings = [];

        serviceDirections.forEach((serviceDirection, i) => {
            timings.push({
                destination: serviceDirection.interchanges[1],
                direction: serviceDirection.routeDirection,
                stops: []
            });
            serviceDirection.stops.forEach(busStop => {
                let {busStopCode, busStopName, stopNumber} = busStop;
                let busStopTimings = busTimings[busStopCode] || [];

                let serviceTimings = busStopTimings.filter(service => service.service === serviceDirection.fullService)[0] || [];

                timings[i].stops[stopNumber] = {
                    busStopCode, busStopName, stopNumber,
                    timings: serviceTimings.timings || []
                }
            });
        });

        res.json(timings);
    });
};
