const BusServiceAPI = require('..').BusServiceAPI,
	prettySeconds = require('pretty-seconds');

var api = new BusServiceAPI(require('./read-config')());

api.getBusServicesOperatingNow(services => {
	for (let service of services)
		console.log(`Service ${service.serviceNo} is operating now under ${service.operator} on direction ${service.direction}`);

	console.log(`
Stats for nerds:
Total services operating now: ${services.length}
Number of trunks: ${services.filter(e=>e.serviceType==='TRUNK').length}
Number of feeders: ${services.filter(e=>e.serviceType==='FEEDER').length}
Number of SMRT Services: ${services.filter(e=>e.operator==='SMRT').length}
Number of SBS Services: ${services.filter(e=>e.operator==='SBST').length}
Number of TTS Services: ${services.filter(e=>e.operator==='TTS').length}
Number of GAS Services: ${services.filter(e=>e.operator==='GAS').length}
`);
});
