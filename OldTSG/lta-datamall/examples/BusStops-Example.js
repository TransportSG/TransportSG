const BusStopsAPI = require('..').BusStopsAPI;

var api = new BusStopsAPI(require('./read-config')());

api.getBusStopsOperatingNow(stops => {
	for (let stop of stops) {
		console.log(`
Bus Stop ${stop.busStopCode}:
	Name: ${stop.nearbyIdentifiers},
	Latitude: ${stop.latitude}
	Longitude: ${stop.longitude}`);
	}
}, 5);
