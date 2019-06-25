module.exports = (skip, callback) => {
	switch (skip) {
		case 0:
			callback({
				"value": [{
					BusStopCode: 12345,
					RoadName: "Unicorn Road",
					Description: "Where unicorns live",
					Latitude: 1,
					Longitude: 1
				}]
			});
			break;
		case 1:
			callback({
				"value": [{
					BusStopCode: 12346,
					RoadName: "2Na Rd.",
					Description: "Opposite 2Na Production Plant",
					Latitude: 0,
					Latitude: 0
				}]
			});
			break;
		default:
			callback({"value": []});
			break;
	}
};
