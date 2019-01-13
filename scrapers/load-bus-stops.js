const DatabaseConnection = require('../application/database/DatabaseConnection');

const BusStopsLister = require('./lib/BusStopsLister');

const ltaConfig = require('./lta-config.json');
const config = require('../config.json');

let promises = [];

let database = new DatabaseConnection(config.databaseURL, 'TransportSG');
let busStops = null;

let busStopsLister = new BusStopsLister(ltaConfig.accessKey);

database.connect((err) => {
    busStops = database.getCollection('bus stops');
    busStops.createIndex({ position: "2dsphere", busStopCode: 1 });

    busStopsLister.getData(data => {
        let completedBusStops = [];

        data.map(transformBusStopData).forEach(busStop => {
            promises.push(new Promise(resolve => {
                if (completedBusStops.includes(busStop.busStopCode)) return;

                updateBusStopData(busStop, resolve);
            }));
        });

        Promise.all(promises).then(() => {
            console.log('Completed ' + promises.length + ' entries');
            process.exit(0);
        });
    });
});


function transformBusStopData(busStop) {
    if (busStop.Description.length >= 6 && busStop.Description.match(/^[^a-z]+$/)) {
        busStop.Description = busStop.Description.replace(/([A-Z])([^ ]+)/g, (search, m1, m2) => {
            if (['CP', 'LP', 'UTOC'].includes(search)) return search;
            return m1 + m2.toLowerCase();
        });
        if (busStop.Description.toLowerCase().includes('st kinetics')) busStop.Description = busStop.Description.replace('St', 'ST');
    }

    return {
        busStopCode: busStop.BusStopCode.toString(),
        busStopName: busStop.Description,
        position: {
            type: "Point",
            coordinates: [busStop.Longitude, busStop.Latitude]
        },
        roadName: busStop.RoadName,
    };
}

function updateBusStopData(data, resolve) {
    let query = {
        busStopCode: data.busStopCode
    };

    busStops.findDocument(query, (err, busStop) => {
        if (!!busStop) {
            busStops.updateDocument(query, {$set: data}, () => {
                resolve();
            });
        } else {
            busStops.createDocument(data, () => {
                resolve();
            });
        }
    })
}
