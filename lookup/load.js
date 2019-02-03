const fs = require('fs');
const parse = require('csv-parse');

const DatabaseConnection = require('../application/database/DatabaseConnection');

const config = require('../config.json');

let database = new DatabaseConnection(config.databaseURL, 'TransportSG');
let buses = null;

let completed = 0;

const fileTypes = {
    'TIBS': 'TIB',
    'CSS': 'CSS',
    'SBST': 'SBS',
    'SBSR': 'SBS-R',
    'SG': 'SG',
    'SMRT': 'SMB',
    'PA': 'PA',
    'PC': 'PC',
    'PZ': 'PZ',
    'RU': 'RU',
    'WC': 'WC',
    'CB': 'CB',
    'SH': 'SH',
    'PH': 'PH',
    'R': 'R'
};

database.connect({
    poolSize: 500
}, (err) => {
    buses = database.getCollection('bus registrations');

    load();
});

let currentOperatorIndex = 0;
let highestOperatorIndex = Object.keys(fileTypes).length;

function load() {
    loadOperator(currentOperatorIndex, numberCompleted => {
        console.log(Object.keys(fileTypes)[currentOperatorIndex] + ': ' + numberCompleted + ' entries');
        completed += numberCompleted;

        currentOperatorIndex++;
        if (currentOperatorIndex === highestOperatorIndex) {
            console.log('Completed ' + completed + ' entries');
            process.exit();
        }

        load();
    });
}

function loadOperator(index, callback) {
    let operatorName = Object.keys(fileTypes)[index];

    var regoPrefix = fileTypes[operatorName];

    fs.readFile('./data/' + operatorName + '.csv', (err, data) => {
        parse(data, (err, busList) => {
            busList.splice(0, 1);

            processRegoSet(regoPrefix, busList, operatorName === 'R').then(numberCompleted => {
                callback(numberCompleted);
            });
        });
    });
}

function transformData(regoPrefix, csv) {
    let status;
    if (csv[11].includes('(R)')) {
        csv[11] = csv[11].replace('(R)', '').trim();
        status = 'Retired';
    } else if (csv[11].includes('(L)')) {
        csv[11] = csv[11].replace('(L)', '').trim();
        status = 'Layup';
    } else if (csv[11].includes('(A)')) {
        csv[11] = csv[11].replace('(A)', '').trim();
        status = 'Accident';
    } else if (csv[11] === 'Not Registered') {
        csv[10] = csv[11] = '';
        status = 'Unregistered';
    }
    return {
        registration: {
            prefix: regoPrefix,
            number: csv[0]*1,
            checksum: csv[1],
        },
        busData: {
            make: csv[2],
            model: csv[3],

            livery: csv[8],
            bodywork: csv[4],
            chassis: csv[6],
            deregDate: csv[7] ? new Date(csv[7] + ' GMT +0000') : null,
            gearbox: csv[13],
            edsModel: csv[14],
        },
        operator: {
            operator: csv[5],
            depot: csv[10],
            permService: csv[11].split('/')[0],
            crossOvers: csv[11].split('/').slice(1).map(svc => svc.replace('*', '')),
            status
        }, fleet: {
            batch: csv[12],

            ad: csv[18]
        },
        misc: {
            chair: csv[15],
            door: csv[16],
            aircon: csv[17],
            notes: csv[9]
        }
    };
}

function updateBus(query, data, resolve) {
    buses.findDocument(query, (err, bus) => {
        if (!!bus) {
            if (data.operator.operator === bus.operator.operator && !data.operator.permService) {
                data.operator.permService = bus.operator.permService;
                data.operator.crossOvers = bus.operator.crossOvers;
                data.operator.depot = bus.operator.depot;
                data.fleet.ad = bus.fleet.ad;
            }
            buses.updateDocument(query, {
                $set: data
            }, () => {
                resolve();
            });
        } else {
            buses.createDocument(data, () => {
                resolve();
            })
        }
    });
}

function processRegoSet(regoPrefix, busList, readPrefixFromFile) {
    let promises = [];

    busList.forEach(busCSV => {
        if (readPrefixFromFile)
            regoPrefix = busCSV.splice(0, 1)[0];

        if (busCSV[2] === '') return;

        let busData = transformData(regoPrefix, busCSV);

        let query = {
            'registration.prefix': busData.registration.prefix,
            'registration.number': busData.registration.number
        };

        promises.push(new Promise(resolve => {
            updateBus(query, busData, resolve);
        }));
    });

    return new Promise(resolve => {
        Promise.all(promises).then(() => {
            resolve(promises.length);
        });
    });
}
