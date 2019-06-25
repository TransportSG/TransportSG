const BusStopsAPI = require('../').BusStopsAPI,
	busStopsAPIMock = require('./bus-stops-mock');

describe('The Bus Stops API', () => {
	it('should return a list of bus stops', () => {
		var api = new BusStopsAPI('key', {
			requester: busStopsAPIMock
		});
		api.getBusStopsOperatingNow(stops => {
			expect(stops.length).toBeGreaterThan(0);
		});
	});
	it('should return basic data about the bus stop', () => {
		var api = new BusStopsAPI('key', {
			requester: busStopsAPIMock
		});
		api.getBusStopsOperatingNow(stops => {
			expect(stops[0].busStopCode).not.toBeUndefined();
		});
	});
	it('should throw an exception if no API key is provided', () => {
		expect(() => new BusStopsAPI()).toThrow();
	});
	it('should not throw an exception if an API key is provided', () => {
		expect(() => new BusStopsAPI('key')).not.toThrow();
	});
});
