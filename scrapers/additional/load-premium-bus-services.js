const parse = require('csv-parse/lib/sync');
const fs = require('fs');
const DatabaseConnection = require('../../application/database/DatabaseConnection');
const config = require('../../config');

let database = new DatabaseConnection(config.databaseURL, 'TransportSG');

let csvData = fs.readFileSync('./premium-bus-services.csv').toString();

let lines = parse(csvData, {
  columns: true,
  skip_empty_lines: true
});

let premiumServices = lines.filter(line => line.BUS_SERVICE_NAME_TXT.match(/PBS \d+/));

let serviceData = {};

function calcDist(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 +
          c(lat1 * p) * c(lat2 * p) *
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

function parseTime(time) {
    let parts = time.match(/(\d+)/g);
    let hour = parts[0]*1, minutes = parts[1]*1;
    let minutesSinceMidnight = hour * 60 + minutes;

    return minutesSinceMidnight;
}

function findTimeDifference(a, b) {
    a = parseTime(a), b = parseTime(b);
    let diff = Math.abs(a - b);

    return diff;
}

function calculateFrequency(departures) {
    departures = departures.toLowerCase();
    if (departures.includes('/')) {
        let frequency = departures.split('/')[1].match(/(\d+)/g);
        return {min: frequency[0], max: frequency.reverse()[0]};
    } else if (departures.includes('one') && departures.includes('at')) {
        return {min: 0, max: 0};
    } else if (!departures.includes('/')) {
        let times = departures.match(/([.\d]{1,4}\wm)/g);
        let intervals = times.map((time, i) => {
            if (i == 0) return null;
            return findTimeDifference(time, times[i - i]);
        }).filter(Boolean).sort((a,b) => a - b);

        return {min: intervals[0], max: intervals.reverse()[0]};
    } else if (departures.includes('headway')) {
        let headway = departures.match(/\((\d+) min[\w ]+\)/)[1];
        return {min: headway, max: headway}
    }
}

function pad(str, pad, length) {
    return Array(length).fill(pad).concat([...str]).slice(-length).join('');
}

function findFirstAndLastBus(departures) {
    let times = departures.match(/([.\d]{1,4} ?\wm)/g);
    times = times.map(parseTime).sort((a, b) => a - b).map(time => {
        let hours = Math.floor(time / 60)+'';
        let minutes = time % 60+'';
        return pad(hours, 0, 2) +  pad(minutes, 0, 2);
    });

    let firstBus = times[0], lastBus = times.reverse()[0];

    return {firstBus, lastBus};
}

let promises = [];
let firstStops = {};

function parseLine(serviceLine, busStopInfo, resolve) {
    let serviceNumber = serviceLine.BUS_SERVICE_NAME_TXT.match(/PBS (\d+)/)[1];
    if (!serviceData[serviceNumber]) serviceData[serviceNumber] = {};

    let routeDirection = serviceLine.BUS_DIRCTN_TXT;
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
        firstBus: firstLastBus.firstBus,
        lastBus: firstLastBus.lastBus,
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

        Object.values(serviceData).forEach(data => {

            morePromises.push(new Promise(resolve => {
                let query = {
                    fullService: data.fullService,
                    routeDirection: data.routeDirection
                };

                busServices.findDocument(query, (err, busService) => {
                    if (!!busService) {
                        busServices.updateDocument(query, data, resolve);
                    } else {
                        busServices.createDocument(data, resolve);
                    }
                });
            }));
        });

        Promise.all(morePromises).then(() => {
            console.log('updated ' + Object.values(serviceData).length + ' services')
            process.exit(0);
        });
    });
});
