const BusRoutesAPI = require('..').BusRoutesAPI;

var api = new BusRoutesAPI(require('./read-config')());

api.getBusRoutesOperatingNow(routes => {
	console.log(`Routes currently operating: ${routes.currentlyOperating}`);
	for (let serviceID of routes.currentlyOperating) {
		var service = routes[serviceID];
		console.log(`
Service ${serviceID}
	Operator: ${service.operator}`);
	}
}, 5);
