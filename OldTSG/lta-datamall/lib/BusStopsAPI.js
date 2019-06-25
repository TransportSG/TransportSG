const request = require('request');

class BusStopsAPI {

	constructor(apiKey, options) {
		if (!apiKey || typeof apiKey !== 'string') throw new TypeError('API Key must be a string!');
		this.apiKey = apiKey;
		this.options = Object.assign({
			requester: null
		}, options || {});
	}

	getBusStopsOperatingNow(callback, timeout) {
		timeout = timeout || Infinity;
		var timeNow = +new Date();
		var allStops = [],
			currentPage = -1;
		function done() {
			callback(allStops);
		}
		var loop = (page) => {
			this.getBusStops(++currentPage, services => {
				if (services.length !== 0 && (+new Date - timeNow) / 1000 <= timeout) {
					allStops = allStops.concat(services);
					loop(currentPage);
				} else done();
			});
		}
		loop(0);
	}

	getBusStops(page, callback) {
		this.getData(page, payload => {
			var services = payload.value;
			callback(services.map(e => {return {
				busStopCode: e.BusStopCode,
				roadName: e.RoadName,
				nearbyIdentifiers: e.Description,
				latitude: e.Latitude,
				longitude: e.Longitude
			}}));
		});
	}

	getData(page, callback) {
		if (this.options.requester) this.options.requester(page, callback);
		else
			request({
				url: `http://datamall2.mytransport.sg/ltaodataservice/BusStops?\$skip=${page*50}`,
				headers: {
					'AccountKey': this.apiKey
				}
			}, (err, res) => {
				callback(JSON.parse(res.body));
			});
	}

}

module.exports = BusStopsAPI;
