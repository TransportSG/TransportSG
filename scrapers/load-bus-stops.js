const DatabaseConnection = require('../application/database/DatabaseConnection');

const BusStopsLister = require('./lib/BusStopsLister');

const ltaConfig = require('./lta-config.json');
const config = require('../config');

let remaining = 0;
let completed = 0;

let database = new DatabaseConnection(config.databaseURL, 'TransportSG');
let busStops = null;

let busStopsLister = new BusStopsLister(ltaConfig.accessKey);

database.connect((err) => {
    busStops = database.getCollection('bus stops');
    busStopsLister.getData(data => {
        let completedBusStops = [];

        data.map(transformBusStopData).forEach(busStop => {
            if (completedBusStops.includes(busStop.busStopCode)) return;

            updateBusStopData(busStop);
        });
    });
});


function transformBusStopData(busStop) {
    return {
        busStopCode: busStop.BusStopCode.toString(),
        busStopName: busStop.Description,
        position: {
            latitude: busStop.Latitude,
            longitude: busStop.Longitude
        },
        roadName: busStop.RoadName,
    };
}

function updateBusStopData(data) {
    let query = {
        busStopCode: data.busStopCode
    };

    remaining++;

    busStops.findDocument(query, (err, busStop) => {
        if (!!busStop) {
            busStops.updateDocument(query, {$set: data}, () => {
                completed++;
            });
        } else {
            busStops.createDocument(data, () => {
                completed++;
            });
        }
    })
}

setInterval(() => {
    if (remaining > 0 && remaining === completed) {
        console.log('Completed ' + completed + ' entries')
        process.exit(0);
    }
}, 100);
