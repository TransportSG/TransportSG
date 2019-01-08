let express = require('express');
let router = new express.Router();
let mrtStations = require('../timings/mrt/station-data.json');

let safeRegex = require('safe-regex');

router.get('/', (req, res) => {
    res.render('search');
});

router.post('/', (req, res) => {
    let query = (req.body.query || '').trim();

    res.loggingData = query;

    search(res.db, query, (err, results) => {
        render(res, err, results);
    });
});

function resolveInterchanges(services, busServices, busStops, callback) {
    let promises = [];

    services.forEach((service, i) => {

        promises.push(new Promise(resolve => {
            let {interchanges} = service;

            if (interchanges[0] == interchanges[1]) { // Loop
                busStops.findDocument({ busStopCode: interchanges[0] }, (err, interchange) => {
                    services[i].interchangeNames = [interchange, service.loopPoint];
                    resolve();
                });
            } else {
                busServices.findDocument({ fullService: service.fullService, routeDirection: [2,1][service.routeDirection-1]}, (err, dir2) => {
                    let newInts = [interchanges[0]];

                    let resolvedInterchanges = [];
                    if (!!dir2) {
                        newInts.push(dir2.interchanges[0])
                    } else newInts.push(service.interchanges[1]);

                    let p2 = [];

                    newInts.forEach((int, j) => {
                        p2.push(new Promise(r2 => {
                            busStops.findDocument({
                                busStopCode: int
                            }, (err, int) => {
                                resolvedInterchanges[j] = int;
                                r2();
                            });
                        }));
                    });

                    Promise.all(p2).then(() => {
                        services[i].interchangeNames = resolvedInterchanges;
                        resolve();
                    });
                });
            }
        }));

    });

    Promise.all(promises).then(() => {
        callback(services);
    });
}

function findMRTStationsByName(name) {
    let foundStations = [];

    Object.keys(mrtStations).forEach(lineName => {
        let {stations} = mrtStations[lineName];
        stations.forEach(station => {
            if (station.stationName.toLowerCase() === name.toLowerCase())
                foundStations.push({station, lineName});
        });
    });

    return foundStations;
}

function findMRTStationByNumber(stationNumber) {
    let foundStations = [];

    Object.keys(mrtStations).forEach(lineName => {
        let {stations} = mrtStations[lineName];
        stations.forEach(station => {
            if (station.stationNumber.toLowerCase() === stationNumber.toLowerCase())
                foundStations.push({station, lineName});
        });
    });

    return foundStations;
}

function escapeRegExp(string){
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function search(db, query, callback) {
    let busStops = db.getCollection('bus stops');
    let busServices = db.getCollection('bus services');

    if (query === '') {
        callback(null, []);
        return;
    } else if (!safeRegex(query)) {
        callback('Invalid query');
        return;
    }

    queyr = query.trim();

    let partialQuery = new RegExp(escapeRegExp(query), 'i');
    let fullQuery = new RegExp('^' + escapeRegExp(query) + '$', 'i');

    let search = {
        $or: [
            {
                busStopCode: query
            },
            {
                roadName: query.length > 5 ? partialQuery : fullQuery
            }
        ]
    };

    let highResults = ['blk', 'opp', 'bef', 'aft'];

    let queryWords = query.toLowerCase().split(' ');
    let hasHighResultWord = queryWords.filter(word => highResults.includes(word)).length > 0;

    if (hasHighResultWord) {
        search.$or.push({ busStopName: new RegExp('^' + escapeRegExp(query) + '\\w?$', 'i') });
    } else {
        if (query.length <= 3)
           search.$or.push({ busStopName: fullQuery });
         else
            search.$or.push({ busStopName: partialQuery });
    }

    busStops.findDocuments(search).toArray((err, busStopList) => {
        busStopList = busStopList.sort((a, b) => a.busStopName.length - b.busStopName.length);

        busServices.findDocuments({
            $or: [{ fullService: fullQuery }, { serviceNumber: fullQuery }],
            routeDirection: 1
        }).toArray((err, busServiceList) => {
            resolveInterchanges(busServiceList, busServices, busStops, busServices => {

                busServices = busServices.sort((a, b) => a.fullService.length - b.fullService.length);

                let mrtStations = findMRTStationsByName(query).concat(findMRTStationByNumber(query));

                callback(null, {busStops: busStopList, busServices, mrtStations});
            });
        });
    });
}

function render(res, err, results) {
    res.render('search/results', results);
}

router.resolveInterchanges = resolveInterchanges;

module.exports = router;
