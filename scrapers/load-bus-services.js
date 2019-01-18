const DatabaseConnection = require('../application/database/DatabaseConnection');

const BusServiceLister = require('./lib/BusServiceLister');

const ltaConfig = require('./lta-config.json');
const config = require('../config.json');

let remaining = 0;
let completed = 0;

let database = new DatabaseConnection(config.databaseURL, 'TransportSG');
let busServices = null;

let busServiceLister = new BusServiceLister(ltaConfig.accessKey);

let promises = [];

database.connect((err) => {
    busServices = database.getCollection('bus services');
    busServiceLister.getData(data => {
        console.log('loaded data, ' + data.length + ' entries')

        data.map(applyOverrides).map(transformBusServiceData).forEach(busService => {
            promises.push(new Promise(resolve => {
                updateBusServiceData(busService, resolve);
            }));
        });

        Promise.all(promises).then(() => {
            console.log('Completed ' + promises.length + ' entries');
            process.exit(0);
        });
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

function applyOverrides(busService) { // take into account odpbt
    if(['253', '255', '257'].includes(busService.ServiceNo)) {
        busService.AM_Offpeak_Freq = '30-30';
        busService.PM_Offpeak_Freq = busService.AM_Offpeak_Freq;
    }
    if(['400', '402'].includes(busService.ServiceNo)) {
        busService.AM_Offpeak_Freq = '40-40';
        busService.PM_Offpeak_Freq = busService.AM_Offpeak_Freq;
    }

    return busService;
}

function transformBusServiceData(busService) {
    if (busService.ServiceNo.includes('CT')) busService.Category = 'CHINATOWN';
    if (busService.Category === 'NIGHT SERVICE') busService.Category = 'NIGHT OWL';
    if (busService.Category === 'CITY_LINK') busService.Category = 'CITY DIRECT';

    if (busService.DestinationCode === '02089') busService.DestinationCode = '02099';
    if (busService.DestinationCode === '11389') busService.DestinationCode = '11379';
    if (busService.DestinationCode === '22199') busService.DestinationCode = '22609';
    if (busService.DestinationCode === '55311') busService.DestinationCode = '55009';
    if (busService.DestinationCode === '03218') busService.DestinationCode = '03239';

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
                max: busService.AM_Peak_Freq.split('-')[1] || busService.AM_Peak_Freq.split('-')[0]
            }, afternoon: {
                min: busService.AM_Offpeak_Freq.split('-')[0],
                max: busService.AM_Offpeak_Freq.split('-')[1] || busService.AM_Offpeak_Freq.split('-')[0]
            }, evening: {
                min: busService.PM_Peak_Freq.split('-')[0],
                max: busService.PM_Peak_Freq.split('-')[1] || busService.PM_Peak_Freq.split('-')[0]
            }, night: {
                min: busService.PM_Offpeak_Freq.split('-')[0],
                max: busService.PM_Offpeak_Freq.split('-')[1] || busService.PM_Offpeak_Freq.split('-')[0]
            }
        },

        loopPoint: busService.LoopDesc
    };
}

function updateBusServiceData(data, resolve) {
    let query = {
        fullService: data.fullService,
        routeDirection: data.routeDirection
    };

    if (data.routeType.includes('FLAT FARE')) {
        resolve();
        return;
    }

    busServices.findDocument(query, (err, busService) => {
        if (!!busService) {
            busServices.updateDocument(query, {$set: data}, () => {
                resolve();
            });
        } else {
            busServices.createDocument(data, () => {
                resolve();
            });
        }
    });
}
