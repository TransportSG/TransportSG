const BusServiceAPI = require('../').BusServiceAPI,
	busServiceAPIMock = require('./bus-service-mock');

describe('The Bus Service API', () => {
	it('should return an array of bus services', () => {
		var api = new BusServiceAPI('key', {
			requester: busServiceAPIMock
		});
		api.getBusServicesOperatingNow(services => {
			expect(services instanceof Array).toBe(true);
			expect(services[0].serviceNo).not.toBeUndefined();
		});
	});
	it('should throw an exception if no API key is provided', () => {
		expect(() => new BusServiceAPI()).toThrow();
	});
	it('should not throw an exception if an API key is provided', () => {
		expect(() => new BusServiceAPI('key')).not.toThrow();
	});
});
