const {BusTimingAPI} = require('../../lta-datamall')
        NodeCache = require('node-cache');

const configs = require('../../config.js');

const busTimingAPI = new BusTimingAPI(configs.accountKey),
        cache = new NodeCache({
            stdTTL: 15
        });

exports.getBusStopTimings = (busStop, callback) => {
    if (!busStop.match(/^\d+$/)) {
        callback({
            status: 400,
            message: {
                Error: 'InvalidBusStopCode',
                Message: 'The bus stop code given is incorrect'
            }
        }, null);
        return;
    }
    cache.get(busStop, (err, stop) => {
        if (!err) {
            if (!stop) {
                busTimingAPI.getTimingForStop(busStop, stop => {
                    stop.cacheTime = +new Date();
                    stop.isCached = false;
                    cache.set(busStop, stop, () => {
                        callback(null, stop);
                    });
                });
            } else {
                var now = +new Date();
                var difference = now - stop.cacheTime;
                stop.services.forEach(service => {
                    stop.timings[service].buses = stop.timings[service].buses.map(bus => {
                        bus.secondsToArrival = Math.floor(Math.max(0, (bus.arrival - now) / 1000));
                        return bus;
                    });
                });
                stop.isCached = true;
                callback(null, stop);
            }
        }
    });
}

