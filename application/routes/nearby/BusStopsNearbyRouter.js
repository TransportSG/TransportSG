let express = require('express');
let router = new express.Router();

function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 +
          c(lat1 * p) * c(lat2 * p) *
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

router.get('/', (req, res) => {
    res.render('bus/stops/nearby');
});

function findNearbyBusStops(busStops, position, callback) {
    let {latitude, longitude} = position;

    busStops.findDocuments({
        position: {
            $nearSphere: {
                $geometry: {
                    type: "Point",
                    coordinates: [longitude, latitude]
                },
                $maxDistance: 500
            }
        }
    }).toArray(callback);
}

router.post('/', (req, res) => {
    let busStops = res.db.getCollection('bus stops');
    let {latitude, longitude} = req.body;
    findNearbyBusStops(busStops, req.body, (err, busStops) => {
        res.render('bus/stops/nearby/results', {
            busStops: busStops.map(busStop => {
                busStop.distance = distance(latitude, longitude,
                    busStop.position.coordinates[1], busStop.position.coordinates[0]);

                return busStop;
            }).sort((a, b) => a.distance - b.distance)
        });
    });
})

module.exports = router;
module.exports.findNearbyBusStops = findNearbyBusStops;
