module.exports = (skip, callback) => {
	switch (skip) {
		case 0:
			callback({
				"value": [{
					"ServiceNo": "123",
					"Operator": "SRMT",
					"Direction": 1,
					"StopSequence": 1,
					"BusStopCode": "14141",
					"Distance": 0,
					"WD_FirstBus": "0612",
					"WD_LastBus": "2345",
					"SAT_FirstBus": "0612",
					"SAT_LastBus": "2345",
					"SUN_FirstBus": "0612",
					"SUN_LastBus": "2345"
				}]
			});
			break;
		case 1:
			callback({
				"value": [{
					"ServiceNo": "123",
					"Operator": "SRMT",
					"Direction": 1,
					"StopSequence": 2,
					"BusStopCode": "14121",
					"Distance": 2,
					"WD_FirstBus": "0600",
					"WD_LastBus": "2330",
					"SAT_FirstBus": "0600",
					"SAT_LastBus": "2330",
					"SUN_FirstBus": "0600",
					"SUN_LastBus": "2330"
				}]
			});
			break;
		default:
			callback({"value": []});
			break;
	}
};
