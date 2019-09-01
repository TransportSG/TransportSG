let express = require('express');
let router = new express.Router();

const moment = require('moment');
require('moment-precise-range-plugin');
const safeRegex = require('safe-regex');
const path = require('path');

const config = require('../../config.json');

let operatorCss = {
    'Go Ahead Singapore': 'gas',
    'SBS Transit': 'sbst',
    'Singapore Bus Services': 'sbs',
    'Tower Transit Singapore': 'tts',
    'LTA Storage': 'lta',
    'Trans Island Buses': 'tibs',
    'SMRT Buses': 'smrt',
    'Sentosa': 'sentosa',
    'Singapore Shuttle Bus': 'css',
    'City Shuttle Service': 'css'
};

router.use('/static', express.static(path.join(__dirname, '../static')));

router.get('/', (req, res) => {
    let host = req.hostname || req.headers.host;

    res.render('bus/lookup', {
        standalone: host === 'bus.' + config.websiteDNSName
    });
});

router.post('/', (req, res) => {
    let query = req.body.query;
    let method = req.body.method;

    res.loggingData = query + ';' + method;

    if (method === 'rego') {
        searchRego(req, res, query * 1);
    } else if (method === 'service') {
        searchByService(req, res, query);
    } else if (method === 'advanced') {
        advancedSearch(req, res, query);
    } else {
        res.status(400).end('Invalid method');
    }
});

function expandRange(input) {
    return input ? input.replace(/_/g, '[\\w ]') : null;
}

function limitSearch(svc) {
    return svc.match(/\d/) ? '^' + svc + '$' : svc;
}

function searchByService(req, res, query) {
    if (!safeRegex(query)) {
        res.status(400).end('Invalid query');
        return;
    }

    let parts = query.match(/^(\w+)? ?([\w]+\*?)?\/?(\w+)?/);

    let depot = expandRange(parts[1]),
        service = expandRange(parts[2]),
        crossOvers = expandRange(parts[3]);

    if (!service && !!depot) {
        service = depot;
        depot = null;
    }

    let or = [];
    if (service) {
        if (!service.includes('*'))
            or.push({'operator.permService': new RegExp(limitSearch(service), 'i')});
        service = service.replace('*', '');
        or.push({
            'operator.crossOvers': {
                $in: [new RegExp(limitSearch(service), 'i')]
            }
        });
    }
    if (crossOvers) {
        let svcs = crossOvers.split('/');
        or.push({
            'operator.crossOvers': {
                $in: svcs.map(e=>new RegExp(limitSearch(service), 'i'))
            }
        });
    }

    if (!or.length) {
        or.push({
            'operator.permService': new RegExp(service, 'i')
        });
        return;
    }

    res.db.getCollection('bus registrations').findDocuments({$or: or}).toArray((err, buses) => {
        if (depot)
            buses = buses.filter(bus => {
                return bus.operator.depot === depot.toUpperCase();
            });
        renderBuses(req, res, buses);
    });
}

function searchRego(req, res, number) {
    let buses = res.db.getCollection('bus registrations');

    buses.findDocuments({
        $or: [
            { 'registration.number': number },
            { 'misc.notes': new RegExp('Re-registered as [A-Z]' + number + '[A-Z]', 'i') },
            { 'misc.notes': new RegExp('Re-registered from [A-Z]' + number + '[A-Z]', 'i') }
        ]
    }).toArray((err, buses) => {
        renderBuses(req, res, buses);
    });
}

let queryKeys = {
    make: 'busData.make',
    model: 'busData.model',
    livery: 'busData.livery',
    bodywork: 'busData.bodywork',
    vin: 'busData.chassis',
    deregDate: 'busData.deregDate',
    edsModel: 'busData.edsModel',
    operator: 'operator.operator',
    depot: 'operator.depot',
    perm: 'operator.permService',
    crossOvers: 'operator.crossOvers',
    advert: 'fleet.ad',
    notes: 'misc.notes'
};

function advancedSearch(req, res, query) {
    let lines = query.match(/^[\w.]+: [\w .,\-%()'"]+$/gm) || [];

    let search = {};

    lines.forEach(line => {
        let matches = line.match(/^([\w.]+): ([\w .,\-%()'"]+)$/);
        let key = matches[1], value = matches[2];
        if (!safeRegex(value)) return;

        let dbKey = queryKeys[key];

        if (key === 'deregDate')
            search[dbKey] = new Date(value + ' GMT +0800');
        else
            search[dbKey] = new RegExp(value, 'i');
    });

    let buses = res.db.getCollection('bus registrations');

    buses.countDocuments(search, (err, busCount) => {
        if (busCount >= 200) {
            res.status(200).end('Too many buses - please refine query');
            return;
        };

        buses.findDocuments(search).toArray((err, buses) => {
            renderBuses(req, res, buses);
        });
    });
}

function performChecks(busRegos, buses, callback) {
    let promises = [];

    buses = buses.map(bus => {
        if ((new Date() - bus.busData.deregDate > 0 || bus.misc.notes.toLowerCase().includes('scrapped')) && !bus.operator.status) {
            bus.operator.status = 'Retired';
            promises.push(new Promise(resolve => {
                busRegos.updateDocument({
                    'registration.prefix': bus.registration.prefix,
                    'registration.number': bus.registration.number
                }, {
                    $set: {
                        'operator.status': 'Retired'
                    }
                }, () => {
                    resolve();
                });
            }));
        }

        return bus;
    });

    Promise.all(promises).then(() => {
        callback(buses);
    });
}

function renderBuses(req, res, buses) {
    buses = buses.map(bus => {
        let deregDate = bus.busData.deregDate;
        if (!deregDate) return bus;

        deregDate = moment(deregDate);
        let now = moment();

        let diff = moment.preciseDiff(now, deregDate, true);

        bus.timeToDereg = `${diff.years? diff.years + " years ":""}${diff.months? diff.months + " months ":""}${diff.days? diff.days + " days":""}`;
        if (bus.timeToDereg === '') {
            bus.timeToDereg = 'Today';
        }

        if (diff.firstDateWasLater) {
            bus.timeToDereg += ' ago';
        }

        bus.daysToDereg = deregDate.diff(now, 'days');

        return bus;
    });

    buses = buses.sort((a, b) => a.registration.number - b.registration.number);

    performChecks(res.db.getCollection('bus registrations'), buses, buses => {
        res.render('bus/lookup/results', {buses, operatorCss});
    });
}

router.get('/sw.js', (req, res, next) => {
    let host = req.hostname || req.headers.host;

    if (host === 'bus.' + config.websiteDNSName) {
        res.setHeader('Cache-Control', 'no-cache');
        res.sendFile(path.join(__dirname, '../static/lookup-sw.js'));
    } else
        next();
});

module.exports = router;
