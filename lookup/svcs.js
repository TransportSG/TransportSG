const request = require('request');
const {JSDOM} = require('jsdom');

const DatabaseConnection = require('../application/database/DatabaseConnection');

const config = require('../config.json');

let database = new DatabaseConnection(config.databaseURL, 'TransportSG');
let buses = null;

database.connect({
    poolSize: 500
}, (err) => {
    buses = database.getCollection('bus registrations');

    load();
});

function load() {
    let completed = 0;
    let promises = [];

    urls.forEach(url => {
        promises.push(new Promise(bigResolve => {
            let urlPromises = [];

            request(url, (err, res, body) => {
                let dom = new JSDOM(body);

                let tables = Array.from(dom.window.document.querySelectorAll('table.toccolours'));
                tables.forEach(table => {

                    let buses = Array.from(table.querySelectorAll('tr')).slice(1);
                    let lastAd = 'N/A';

                    buses.forEach(bus => {
                        let rego = bus.children[0].textContent.trim().match(/([A-Z]+)(\d+)(\w)/).slice(1, 4);
                        let deployment = bus.children[1].textContent.trim().split(' ');
                        let advert = !!bus.children[2] ? bus.children[2].textContent.trim() : lastAd;

                        lastAd = advert;
                        urlPromises.push(new Promise(resolve => {
                            completed++;
                            updateBus(rego, deployment, advert, resolve);
                        }));
                    });
                });

                Promise.all(urlPromises).then(() => {
                    bigResolve();
                });
            });
        }));
    });

    Promise.all(promises).then(() => {
        console.log('Updated ' + promises.length + ' models');
        console.log('Updated ' + completed + ' buses');

        process.exit();
    });
}

function updateBus(rego, deployment, advert, resolve) {
    let query = {
        'registration.prefix': rego[0],
        'registration.number': rego[1] * 1,
        'registration.checksum': rego[2]
    };

    buses.updateDocument(query, {
        $set: {
            'operator.depot': deployment[0] || 'Unknown',
            'operator.permService': deployment[1] ? deployment.slice(1).join(' ').split('/')[0] : 'Unknown',
            'operator.crossOvers': deployment.slice(1).join(' ').split('/').slice(1).map(svc => svc.replace('*', '').trim()).filter(e => e.length),
            'fleet.ad': advert
        }
    }, () => {
        resolve();
    });
}






let urls = [
    'https://sgwiki.com/wiki/Volvo_B5LH',
    'https://sgwiki.com/wiki/Volvo_B8L_(Wright_Eclipse_Gemini_3)',
    'https://sgwiki.com/wiki/Volvo_B9TL_(CDGE)',
    'https://sgwiki.com/wiki/Volvo_B9TL_(Wright_Eclipse_Gemini_2)_(Batch_1)',
    'https://sgwiki.com/wiki/Volvo_B9TL_(Wright_Eclipse_Gemini_2)_(Batch_2)',
    'https://sgwiki.com/wiki/Volvo_B9TL_(Wright_Eclipse_Gemini_2)_(Batch_3)',
    'https://sgwiki.com/wiki/Volvo_B9TL_(Wright_Eclipse_Gemini_2)_(Batch_4)',
    'https://sgwiki.com/wiki/Volvo_B10TL_(Volgren)',
    'https://sgwiki.com/wiki/Volvo_B10TL_(CDGE)',
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
    'https://sgwiki.com/wiki/Scania_K230UB_(Euro_IV_Batch_1)',
    'https://sgwiki.com/wiki/Scania_K230UB_(Euro_IV_Batch_2)',
    'https://sgwiki.com/wiki/Scania_K230UB_(Euro_V_Batch_1)',
    'https://sgwiki.com/wiki/Scania_K230UB_(Euro_V_Batch_2)',
    'https://sgwiki.com/wiki/Alexander_Dennis_Enviro500_(Batch_1)',
    'https://sgwiki.com/wiki/Alexander_Dennis_Enviro500_(Batch_2)',
    'https://sgwiki.com/wiki/MAN_NG363F',
    'https://sgwiki.com/wiki/Mercedes-Benz_OC500LE',
    'https://sgwiki.com/wiki/Mercedes-Benz_O405G_(Hispano_Habit)'
];
