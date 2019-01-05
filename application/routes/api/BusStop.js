exports.getAllBusStops = (req, res) => {
    let busStops = res.db.getCollection('bus stops');
    busStops.distinct('busStopCode', (err, busStopCodes) => {
        res.json(busStopCodes);
    });
};

exports.getBusStop = (req, res) => {
    let busStops = res.db.getCollection('bus stops');
    busStops.findDocument({
        busStopCode: req.params.busStopCode
    }, {_id: 0}, (err, busStop) => {
        if (busStop)
            delete busStop._id;
        res.json(busStop);
    });
};

exports.getManyBusStops = (req, res) => {
    let busStops = res.db.getCollection('bus stops');

    let busStopCodes = req.params.busStopCodes.split(',');
    busStops.findDocuments({
        $or: busStopCodes.map(busStopCode => { return {busStopCode} })
    }).toArray((err, busStops) => {
        res.json(busStops.map(busStop => { delete busStop._id; return busStop; }));
    });
};
