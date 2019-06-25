const BusRoutesAPI = require('../').BusRoutesAPI,
	busRoutesAPIMock = require('./bus-routes-mock');

describe('The Bus Routes API', () => {
	it('should give a list of bus services currently in operation', () => {
		var api = new BusRoutesAPI('key', {
			requester: busRoutesAPIMock
		});
		api.getBusRoutesOperatingNow(routes => {
			expect(routes.currentlyOperating).not.toBeUndefined();
			expect(routes.currentlyOperating.length).toBeGreaterThan(0);
		});
	});
	it('should give basic info about the service', () => {
		var api = new BusRoutesAPI('key', {
            requester: busRoutesAPIMock
        });
        api.getBusRoutesOperatingNow(routes => {
			expect(routes[123].operator).not.toBeUndefined();
		});
	});
	it('should give a list of stops for the service, and some info about the stops', () => {
		var api = new BusRoutesAPI('key', {
            requester: busRoutesAPIMock
        });
        api.getBusRoutesOperatingNow(routes => {
			expect(routes[123].stops).not.toBeUndefined();
			expect(routes[123].stops.length).toBeGreaterThan(0);
			expect(routes[123].stops[0].busStopID).not.toBeUndefined();
			expect(routes[123].stops[0].timings).not.toBeUndefined();
		});
	});
	it('should throw an exception if no API key is provided', () => {
		expect(() => new BusRoutesAPI()).toThrow();
	});
	it('should not throw an exception if an API key is provided', () => {
		expect(() => new BusRoutesAPI('key')).not.toThrow();
	});
});
