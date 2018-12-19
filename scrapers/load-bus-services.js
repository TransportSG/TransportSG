const DatabaseConnection = require('../application/database/DatabaseConnection');

const BusServiceLister = require('./lib/BusServiceLister');

const ltaConfig = require('./lta-config.json');
const config = require('../config');

let remaining = 0;
let completed = 0;

let database = new DatabaseConnection(config.databaseURL, 'TransportSG');
let busServices = null;

let busServiceLister = new BusServiceLister(ltaConfig.accessKey);

database.connect((err) => {
    busServices = database.getCollection('bus services');
    busServiceLister.getData(data => {
        console.log('loaded data, ' + data.length + ' entries')
        data.map(transformBusServiceData).forEach(updateBusServiceData);
    });
});

function getServiceNumber(service) {
    if (service.startsWith('NR') || service.startsWith('CT')) {
        return service.slice(0, 2);
    } else
        return service.replace(/[A-Za-z#]/g, '');
}

function getServiceVariant(service) {
    if (service.startsWith('NR') || service.startsWith('CT')) {
        return service.slice(2);
    } else
        return service.replace(/[0-9]/g, '').replace(/#/, 'C');
}

function transformBusServiceData(busService) {
    if (busService.ServiceNo.includes('CT')) busService.Category = 'CHINATOWN';
    return {
        fullService: busService.ServiceNo,
        serviceNumber: getServiceNumber(busService.ServiceNo),
        variant: getServiceVariant(busService.ServiceNo),
        routeDirection: busService.Direction,

        routeType: busService.Category,
        operator: busService.Operator,
        interchanges: [
            busService.OriginCode,
            busService.DestinationCode
        ],

        frequency: {
            morning: {
                min: busService.AM_Peak_Freq.split('-')[0],
                max: busService.AM_Peak_Freq.split('-')[1]
            }, afternoon: {
                min: busService.AM_Offpeak_Freq.split('-')[0],
                max: busService.AM_Offpeak_Freq.split('-')[1]
            }, evening: {
                min: busService.PM_Peak_Freq.split('-')[0],
                max: busService.PM_Peak_Freq.split('-')[1]
            }, night: {
                min: busService.PM_Offpeak_Freq.split('-')[0],
                max: busService.PM_Offpeak_Freq.split('-')[1]
            }
        },

        loopPoint: busService.LoopDesc
    };
}

function updateBusServiceData(data) {
    let query = {
        fullService: data.fullService,
        routeDirection: data.routeDirection
    };

    if (data.routeType.includes('FLAT FARE')) return;

    remaining++;

    busServices.findDocument(query, (err, busService) => {
        if (!!busService) {
            busServices.updateDocument(query, data, () => {
                completed++;
            });
        } else {
            busServices.createDocument(data, () => {
                completed++;
            });
        }
    });
}

setInterval(() => {
    if (remaining > 0 && remaining === completed) {
        console.log('Completed ' + completed + ' entries')
        process.exit(0);
    }
}, 100);
