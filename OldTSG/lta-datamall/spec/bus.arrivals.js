const BusTimingAPI = require('../').BusTimingAPI,
	busTimingAPIMock = require('./bus-timing-mock');

describe('The Bus Timing API', () => {
	it('should give a simple list of services for a stop', () => {
		var api = new BusTimingAPI('key', {
			requester: busTimingAPIMock(49121)
		});
		api.getTimingForStop(49121, busStop => {
			expect(busStop.services).not.toBeUndefined();
			expect(busStop.services).toEqual(['925']);
		});
	});
	it('should give the number of avaliable buses for a service.', () => {
		var api = new BusTimingAPI('key', {
			requester: busTimingAPIMock(49121)
		});
		api.getTimingForStop(49121, busStop => {
			expect(busStop.timings['925'].avaliableBuses).toEqual(1);
			expect(busStop.timings['925'].buses.length).toEqual(1);
		});
	});
	it('should throw an exception if no API key is provided', () => {
		expect(() => new BusTimingAPI()).toThrow();
	});
	it('should not throw an exception if an API key is provided', () => {
		expect(() => new BusTimingAPI('key')).not.toThrow();
	});
	it('should return a 0 if the bus has arrived', () => {
		var api = new BusTimingAPI('key', {
            requester: busTimingAPIMock(28009)
        });
        api.getTimingForStop(28009, busStop => {
			expect(busStop.timings['66'].buses[1].secondsToArrival).toBeGreaterThan(0);
			expect(busStop.timings['66'].buses[0].secondsToArrival).toEqual(0);
		});
	});
});
