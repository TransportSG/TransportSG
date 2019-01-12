const DatabaseConnection = require('../application/database/DatabaseConnection');

const BusServiceRouteLister = require('./lib/BusServiceRouteLister');

const ltaConfig = require('./lta-config.json');
const config = require('../config.json');

let remaining = 0;
let completed = 0;

let database = new DatabaseConnection(config.databaseURL, 'TransportSG');
let busServices = null;
let busStops = null;

let busServiceRouteLister = new BusServiceRouteLister(ltaConfig.accessKey);

database.connect({
    poolSize: 50
}, (err) => {
    busStops = database.getCollection('bus stops');
    busServices = database.getCollection('bus services');

    busServiceRouteLister.getData(data => {

        let services = [];
        let groups = [];

        let allServices = Object.keys(data);

        allServices.forEach(serviceNo => {
            let svcData = data[serviceNo];

            Object.keys(svcData).forEach(dir => {
                let dirStops = svcData[dir];

                services.push([serviceNo, dir * 1, dirStops]);
            });
        });

        services.forEach((service, i) => {
            let groupNumber = i % 20;
            groups[groupNumber] = groups[groupNumber] || [];
            groups[groupNumber].push(service);
        });

        let groupCompleted = 0;
        let groupSize = 0;

        let currentGroup = 0;

        function processGroup(groupNumber) {
            if (groups[groupNumber] == null) {
                console.log('Completed ' + completed + ' entries')
                process.exit(0);
            }

            groupCompleted = 0;
            groupSize = groups[groupNumber].length;

            groups[groupNumber].forEach(service => {
                processBusService(service[0], service[1], service[2]).then(() => {
                    groupCompleted++;
                    if (groupSize == groupCompleted)
                        processGroup(++currentGroup);
                });
            });
        }

        processGroup(0);

    });
});

function processBusService(service, direction, busStopsList) {
    return new Promise(resolve => {
        let query = {
            fullService: service,
            routeDirection: direction,
            special: { $exists: false }
        };

        let promises = [];
        let finalBusStops = [];

        busStopsList.forEach((busStop, stopNumber) => {
            promises.push(new Promise(resolve2 => {

                busStops.findDocument({
                    busStopCode: busStop.busStopCode.toString()
                }, (err, busStopInfo) => {

                    if (!busStopInfo) {
                        console.log('INVALID BUS STOP  ' + busStop.busStopCode);
                        finalBusStops[busStop.stopNumber] = null;
                        resolve2();
                        return;
                    }

                    finalBusStops[busStop.stopNumber] = {
                        busStopCode: busStopInfo.busStopCode,
                        busStopName: busStopInfo.busStopName,
                        roadName: busStopInfo.roadName,

                        distance: busStop.distance,
                        stopNumber,
                        firstBus: busStop.firstBus,
                        lastBus: busStop.lastBus
                    };


                    if (service.match(/^\dN$/)) {
                        if ((busStop.distance * 1) < 12)
                            finalBusStops[busStop.stopNumber].busStopType = 'CITY';
                        else
                            finalBusStops[busStop.stopNumber].busStopType = 'TOWN';
                    }

                    resolve2();

                });
            }));
        });

        Promise.all(promises).then(() => {
            remaining++;
            busServices.updateDocument(query, {
                $set: {
                    stops: finalBusStops.filter(b => !!b)
                }
            }, (err, res) => {
                completed++;
                resolve();
            });
        });
    });
};
