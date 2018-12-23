const fs = require('fs');
const csv = require('csv');

const DatabaseConnection = require('../application/database/DatabaseConnection');

const config = require('../config');

let database = new DatabaseConnection(config.databaseURL, 'TransportSG');
let buses = null;

let completed = 0;
let remaining = 0;

const fileTypes = {
    'TIBS': 'TIB',
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
	'PH': 'PH'
};

database.connect((err) => {
    buses = database.getCollection('bus registrations');

    loadCSVs();
});

function loadCSVs() {
    Object.keys(fileTypes).forEach(operatorName => {
        console.log('Doing ' + operatorName);
        var regoPrefix = fileTypes[operatorName];

        fs.readFile('./data/' + operatorName + '.csv', (err, data) => {
            csv.parse(data, (err, busList) => {
                busList.splice(0, 1);

                processRegoSet(regoPrefix, busList);
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
    } else if (csv[11] === 'Not Registered') {
        console.log('unreg')
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
            deregDate: csv[7] ? new Date(csv[7]) : null,
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

function updateBus(query, data) {
    remaining++;

    buses.findDocument(query, (err, bus) => {
        if (!!bus) {
            buses.updateDocument(query, {
                $set: data
            }, () => {
                completed++;
            });
        } else {
            buses.createDocument(data, () => {
                completed++;
            })
        }
    });
}

function processRegoSet(regoPrefix, busList) {
    busList.forEach(busCSV => {
        if (busCSV[2] === '') return;

        let busData = transformData(regoPrefix, busCSV);

        let query = {
            'registration.prefix': busData.registration.prefix,
            'registration.number': busData.registration.number
        };

        updateBus(query, busData);
    });
}

setInterval(() => {
    if (remaining > 0 && remaining === completed) {
        console.log('Completed ' + completed + ' entries')
        process.exit(0);
    }
}, 100);
