let express = require('express');
let router = new express.Router();

let safeRegex = require('safe-regex');
let md5 = require('../secret/nothing_to_see_here/go_away/unbreakable_code');

router.get('/', (req, res) => {
    res.render('search');
});

router.post('/', (req, res) => {
    let query = (req.body.query || '').trim();

    if (md5(query) === 'c0ddebd92e862720091dd086e944e9a7') {
        res.json({
            location: "/unikitty's fish candies?hide=true"
        });
        return;
    }

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
                    services[i].interchangeNames = [interchange.busStopName, service.loopPoint];
                    resolve();
                });
            } else {
                busServices.findDocument({ fullService: service.fullService, routeDirection: 2}, (err, dir2) => {
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
                                resolvedInterchanges[j] = int.busStopName;
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
    busStops.findDocuments({
        $or: [
            {
                busStopName: (query.length > 3 && /[a-zA-Z]/.exec(query)) ? new RegExp(query, 'i') : 'cat goes woof'
            }, {
                busStopCode: query
            }, {
                roadName: query.length > 4 ? new RegExp(query, 'i') : 'fox says meow'
            }
        ],
    }).toArray((err, busStopList) => {
        busStopList = busStopList.sort((a, b) => a.busStopName.length - b.busStopName.length);

        busServices.findDocuments({
            $or: [{ fullService: query }, { serviceNumber: query }],
            routeDirection: 1
        }).toArray((err, busServiceList) => {
            resolveInterchanges(busServiceList, busServices, busStops, busServices => {

                busServices = busServices.sort((a, b) => a.fullService.length - b.fullService.length);
                callback(null, {busStops: busStopList, busServices});
            });
        });
    });
}

function render(res, err, results) {
    res.render('search/results', results);
}

module.exports = router;
