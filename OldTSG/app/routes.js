const Index = require('../app/controllers/Index'),
	BusTimings = require('../app/controllers/BusTimings'),
        BusStops = require('../app/controllers/BusStops'),
        csrf = require('csurf')();

module.exports = app => {
    app.get('/', Index.index);
    app.get('/bus/timings', BusTimings.busTimings);
    app.get('/bus/timings/:busStop', BusTimings.busTimingBlock);
    app.get('/bus/stops', BusStops.busStops);
    app.get('/bus/stops/locate', csrf,  BusStops.busStopFinder);
    app.post('/bus/stops/locate/query', csrf, BusStops.queryBusStops);
    app.get('/bus/stops/:busStopCode', BusStops.queryBusStop);
}
