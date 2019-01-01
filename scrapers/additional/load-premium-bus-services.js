const parse = require('csv-parse/lib/sync');
const fs = require('fs');
const DatabaseConnection = require('../../application/database/DatabaseConnection');
const config = require('../../config');

let { calcDist, calculateFrequency, findFirstAndLastBus, pad } = require('./scraping-utils');

let database = new DatabaseConnection(config.databaseURL, 'TransportSG');

let csvData = fs.readFileSync('./premium-bus-services.csv').toString();

let lines = parse(csvData, {
  columns: true,
  skip_empty_lines: true
});

let premiumServices = lines.filter(line => line.BUS_SERVICE_NAME_TXT.match(/PBS \d+/));

let serviceData = {};

let promises = [];
let firstStops = {};

function parseLine(serviceLine, busStopInfo, resolve) {
    let serviceNumber = serviceLine.BUS_SERVICE_NAME_TXT.match(/PBS (\d+)/)[1];
    if (!serviceData[serviceNumber]) serviceData[serviceNumber] = {};

    let routeDirection = serviceLine.BUS_DIRCTN_TXT * 1;
    let operator = serviceLine.OPR_DESC_TXT;
    let termini = serviceLine.ORIG_DEST_TXT.match(/([\w \/]+) (?:to)?(?:-)? ([\w \/]+)/).slice(1, 3);
    let frequency = calculateFrequency(serviceLine.OP_HR_TXT);
    let firstLastBus = findFirstAndLastBus(serviceLine.OP_HR_TXT);

    if (!serviceData[serviceNumber][routeDirection]) {
        if (!firstStops[serviceNumber])
            firstStops[serviceNumber] = {};

        if (!!busStopInfo) {
            firstStops[serviceNumber][routeDirection] = {
                lat: busStopInfo.position.latitude, long: busStopInfo.position.longitude
            };
        } else {
            firstStops[serviceNumber][routeDirection] = {
                lat: serviceLine.LATTD_TXT*1, long: serviceLine.LONGTD_TXT*1
            };
        }

        serviceData[serviceNumber][routeDirection] = {
            fullService: serviceNumber, serviceNumber, serviceVariant: '', routeDirection,
            routeType: 'PREMIUM', operator,
            interchanges: termini,
            special: true,

            frequency: {
                morning: {
                    min: '-', max: '-'
                }, afternoon: {
                    min: '-', max: '-'
                }, evening: {
                    min: '-', max: '-'
                }, night: {
                    min: '-', max: '-'
                }
            },
            stops: [],
            loopPoint: ''
        };

        if (serviceLine.OP_HR_TXT.toUpperCase().includes('AM')) {
            serviceData[serviceNumber][routeDirection].frequency.morning = frequency
        } else {
            serviceData[serviceNumber][routeDirection].frequency.evening = frequency
        }
    }

    let stopNumber = serviceLine.BUS_ROUTE_SEQ_NUM;
    let distance = 0;

    if (stopNumber !== '1') {
        let prevLat = firstStops[serviceNumber][routeDirection].lat, prevLong = firstStops[serviceNumber][routeDirection].long;
        let currLat = busStopInfo ? busStopInfo.position.latitude : serviceLine.LATTD_TXT*1;
        let currLong = busStopInfo ? busStopInfo.position.longitude : serviceLine.LONGTD_TXT*1;

        distance = calcDist(prevLat, prevLong, currLat, currLong).toFixed(1);
    }


    serviceData[serviceNumber][routeDirection].stops[stopNumber - 1] = {
        busStopCode: serviceLine.BUS_STOP_CD,
        busStopName: busStopInfo ? busStopInfo.busStopName : serviceLine.BUS_STOP_DESC_TXT,
        roadName: busStopInfo ? busStopInfo.roadName : serviceLine.RD_NAM_TXT,

        distance,
        stopNumber,
        firstBus: {
            weekday: firstLastBus.firstBus,
            saturday: '-',
            sunday: '-'
        },
        lastBus: {
            weekday: firstLastBus.lastBus,
            saturday: '-',
            sunday: '-'
        }
    };

    resolve();
}


database.connect({
    poolSize: 50
}, (err) => {
    busStops = database.getCollection('bus stops');
    busServices = database.getCollection('bus services');

    premiumServices.forEach(serviceLine => {
        promises.push(new Promise(resolve => {
            if (serviceLine.BUS_STOP_CD && serviceLine.BUS_STOP_CD !== '-') {
                serviceLine.BUS_STOP_CD = pad(serviceLine.BUS_STOP_CD, 0, 5);

                busStops.findDocument({
                    busStopCode: serviceLine.BUS_STOP_CD
                }, (err, busStop) => {
                    parseLine(serviceLine, busStop, resolve);
                });
            } else {
                parseLine(serviceLine, null, resolve);
            }
        }));
    });

    Promise.all(promises).then(() => {
        let morePromises = [];

        Object.values(serviceData).forEach(svc => {
            Object.values(svc).forEach(data => {
                morePromises.push(new Promise(resolve => {
                    data.stops = data.stops.filter(Boolean);
                    let query = {
                        fullService: data.fullService,
                        routeDirection: data.routeDirection
                    };

                    busServices.findDocument(query, (err, busService) => {
                        if (!!busService) {
                            busServices.updateDocument(query, {
                                $set: data
                            }, resolve);
                        } else {
                            busServices.createDocument(data, resolve);
                        }
                    });
                }));
            });
        });

        Promise.all(morePromises).then(() => {
            console.log('updated ' + morePromises.length + ' services')
            process.exit(0);
        });
    });
});
