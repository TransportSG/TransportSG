const request = require('request');
const {JSDOM} = require('jsdom');

const DatabaseConnection = require('../application/database/DatabaseConnection');

const config = require('../config');

let database = new DatabaseConnection(config.databaseURL, 'TransportSG');
let buses = null;

let completed = 0;
let remaining = 0;

database.connect((err) => {
    buses = database.getCollection('bus registrations');

    load();
});

function load() {
    urls.forEach(url => {
        request(url, (err, res, body) => {
            let dom = new JSDOM(body);

            let tables = Array.from(dom.window.document.querySelectorAll('table.toccolours'));
            tables.forEach(table => {

                let buses = Array.from(table.querySelectorAll('tr')).slice(1);
                let lastAd = 'N/A';

                buses.forEach(bus => {
                    let rego = bus.children[0].textContent.trim().match(/([A-Z]+)(\d+)(\w)/).slice(1, 4);
                    let deployment = bus.children[1].textContent.trim().split(' ').concat(['Unknown']);
                    let advert = !!bus.children[2] ? bus.children[2].textContent.trim() : lastAd;

                    lastAd = advert;

                    updateBus(rego, deployment, advert);
                });

            });
        });
    });
}

function updateBus(rego, deployment, advert) {
    let query = {
        'registration.prefix': rego[0],
        'registration.number': rego[1] * 1,
        'registration.checksum': rego[2]
    };

    remaining++;

    buses.updateDocument(query, {
        $set: {
            'operator.depot': deployment[0],
            'operator.permService': deployment[1].split('/')[0],
            'operator.crossOvers': deployment[1].split('/').slice(1).map(svc => svc.replace('*', '')),
            'fleet.ad': advert
        }
    }, () => {
        completed++;
    });
}

setInterval(() => {
    if (remaining > 0 && remaining === completed) {
        console.log('Completed ' + completed + ' entries')
        process.exit(0);
    }
}, 100);









let urls = [
    'https://sgwiki.com/wiki/Volvo_B8L_(Wright_Eclipse_Gemini_3)',
    'https://sgwiki.com/wiki/Volvo_B9TL_(CDGE)',
    'https://sgwiki.com/wiki/Volvo_B9TL_(Wright_Eclipse_Gemini_2)_(Batch_1)',
    'https://sgwiki.com/wiki/Volvo_B9TL_(Wright_Eclipse_Gemini_2)_(Batch_2)',
    'https://sgwiki.com/wiki/Volvo_B9TL_(Wright_Eclipse_Gemini_2)_(Batch_3)',
    'https://sgwiki.com/wiki/Volvo_B9TL_(Wright_Eclipse_Gemini_2)_(Batch_4)',
    'https://sgwiki.com/wiki/Volvo_B10TL_(Volgren)',
    'https://sgwiki.com/wiki/Volvo_B10TL_(CDGE)',
    'https://sgwiki.com/wiki/Volvo_B10BLE',
    'https://sgwiki.com/wiki/Mercedes-Benz_O530_Citaro_(Batch_SMRT)',
    'https://sgwiki.com/wiki/Mercedes-Benz_O530_Citaro_(Batch_1)',
    'https://sgwiki.com/wiki/Mercedes-Benz_O530_Citaro_(Batch_2)',
    'https://sgwiki.com/wiki/Mercedes-Benz_O530_Citaro_(Batch_3)',
    'https://sgwiki.com/wiki/MAN_NL323F_(Batch_1)',
    'https://sgwiki.com/wiki/MAN_NL323F_(Batch_2)',
    'https://sgwiki.com/wiki/MAN_NL323F_(Batch_3)',
    'https://sgwiki.com/wiki/MAN_NL323F_(Batch_4)',
    'https://sgwiki.com/wiki/MAN_ND323F_(Batch_1)',
    'https://sgwiki.com/wiki/MAN_ND323F_(Batch_2)',
    'https://sgwiki.com/wiki/MAN_ND323F_(Batch_3)',
    'https://sgwiki.com/wiki/MAN_ND323F_(Batch_4)',
    'https://sgwiki.com/wiki/MAN_ND323F_(3-Door)',
    'https://sgwiki.com/wiki/Scania_K230UB_(Euro_IV_Batch_1)',
    'https://sgwiki.com/wiki/Scania_K230UB_(Euro_IV_Batch_2)',
    'https://sgwiki.com/wiki/Scania_K230UB_(Euro_V_Batch_1)',
    'https://sgwiki.com/wiki/Scania_K230UB_(Euro_V_Batch_2)',
    'https://sgwiki.com/wiki/Alexander_Dennis_Enviro500_(Batch_1)',
    'https://sgwiki.com/wiki/Alexander_Dennis_Enviro500_(Batch_2)',
    'https://sgwiki.com/wiki/MAN_NG363F',
    'https://sgwiki.com/wiki/Mercedes-Benz_OC500LE',
    'https://sgwiki.com/wiki/Mercedes-Benz_O405G_(Hispano_Habit)',
    'https://sgwiki.com/wiki/Mercedes-Benz_O405G_(Volgren)',
];
