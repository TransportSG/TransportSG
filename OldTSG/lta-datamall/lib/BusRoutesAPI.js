const request = require('request');

class BusRoutesAPI {

	constructor(apiKey, options) {
		if (!apiKey || typeof apiKey !== 'string') throw new TypeError('API Key must be a string!');
		this.apiKey = apiKey;
		this.options = Object.assign({
			requester: null
		}, options || {});
	}

	getBusRoutesOperatingNow(callback, timeout) {
		timeout = timeout || Infinity;
		var timeNow = +new Date();
		var allRoutes = [],
			currentPage = -1;
		function done() {
			var serviceList = {};
			for (let e of allRoutes) {
				if (!serviceList[e.ServiceNo]) {
					serviceList[e.ServiceNo] = {};
					serviceList[e.ServiceNo].service = e.ServiceNo;
					serviceList[e.ServiceNo].operator = e.Operator;
					serviceList[e.ServiceNo].stops = [];
				}
				serviceList[e.ServiceNo].stops.push({
					busStopID: e.BusStopCode,
					stopCount: e.StopSequence,
					distanceFromStart: e.Distance,
					busStopDirection: e.Direction,
					timings: {
						weekdays: {
							firstBus: e.WD_FirstBus,
							lastBus: e.WD_LastBus
						},
						saturday: {
							firstBus: e.SAT_FirstBus,
							lastBus: e.SAT_LastBus
						},
						sunday: {
							firstBus: e.SUN_FirstBus,
							lastBus: e.SUN_LastBus
						}
					}
				});
			}
			var currentlyOperating = [];
			for (let name in serviceList) currentlyOperating.push(name);
			serviceList.currentlyOperating = currentlyOperating;
			callback(serviceList);
		}
		var loop = () => {
			this.getBusRoutes(++currentPage, routes => {
				if (routes.length !== 0 && (+new Date() - timeNow) / 1000 <= timeout) {
					allRoutes = allRoutes.concat(routes);
					loop(currentPage);
				} else done();
			});
		}
		loop();
	}

	getBusRoutes(page, callback) {
		this.getData(page, payload => {
			callback(payload.value);
		});
	}

	getData(page, callback) {
		if (this.options.requester) this.options.requester(page, callback);
		else
			request({
				url: `http://datamall2.mytransport.sg/ltaodataservice/BusRoutes?\$skip=${page*50}`,
				headers: {
					'AccountKey': this.apiKey
				}
			}, (err, res) => {
				callback(JSON.parse(res.body));
			});
	}

}

module.exports = BusRoutesAPI;
