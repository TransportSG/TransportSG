const request = require('request');

class BusTimingAPI {

	constructor(apiKey, options) {
		if (!apiKey || typeof apiKey !== 'string') throw new TypeError('API Key must be a string!');
		this.apiKey = apiKey;
		this.options = Object.assign({
			requester: null
		}, options || {});
	}

	getTimingForStop(busStop, callback) {
		this.getData(busStop, payload => {
			payload = payload.Services;
			callback({
				services: payload.map(service => service.ServiceNo),
				timings: payload.reduce((timings, service) => {
					function timingObj(service, type) {
						var arrival = new Date(service[type].EstimatedArrival);
						return {
							arrival: arrival,
							secondsToArrival: Math.floor(Math.max(0, (arrival - +new Date()) / 1000)),
							load: service[type].Load,
							isWAB: service[type].Feature === 'WAB'
            };
					}
          timings[service.ServiceNo] = {
              buses: [timingObj(service, 'NextBus'), timingObj(service, 'NextBus2'), timingObj(service, 'NextBus3')]
          };
					return timings;
				}, {})
			});
		});
	}

	getData(busStop, callback) {
		if (this.options.requester) this.options.requester(busStop, callback);
		else
			request({
				url: `http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=${busStop}&SST=True`,
				headers: {
					'AccountKey': this.apiKey
				}
			}, (err, res) => {
					callback(JSON.parse(res.body));
			});
	}

}

module.exports = BusTimingAPI;
