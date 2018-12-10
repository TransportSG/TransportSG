const TextParser = require('./parser');
const depotList = require('./naughty_list');

let getBusTimings = require('../../../timings/bus').getTimings;

function parseQuery(query) {
    let parsed = TextParser.parse(query, {
        services: {
            type: /(!?\d+[GWABC#M]?)/,
            canRepeat: true
        },
        wheelchair: ['wab', 'nwab'],
        types: {
            type: ['SD', 'DD', 'BD'],
            canRepeat: true
        },
        depots: {
            type: ['SLBP', 'UPDEP', 'BBDEP', 'HGDEP', 'BNDEP', 'SMBAMDEP', 'SBSAMDEP', 'SEDEP', 'KJDEP', 'WLDEP', 'BUDEP', 'LYDEP'],
            canRepeat: true
        }
    });
    parsed.wheelchair = parsed.wheelchair ? !parsed.wheelchair.includes('n') : -1;
    parsed.types = (parsed.types || []).map(type => Math.max(0, ['', 'SD', 'DD', 'BD'].indexOf(type)).toString());

    return parsed;
}

function resolveServices(parsed) {
    let depots = parsed.depots || [];

    let svcs = depots.map(depot => depotList[depot]).reduce((acc, dep) => acc.concat(dep), []);

    let allSvcs = (parsed.services || []).concat(svcs);
    parsed.services = allSvcs.filter((svc, i) => allSvcs.indexOf(svc) == i)
        .filter(svc => allSvcs.indexOf('!' + svc) === -1);

    return parsed;
}

function filter(timings, check) {
    let newTimings = {};
    Object.keys(timings).map(busStopCode => {
        newTimings[busStopCode] = timings[busStopCode].filter(check);
    });
    return newTimings;
}

function map(timings, mapper) {
    let newTimings = {};
    Object.keys(timings).map(busStopCode => {
        newTimings[busStopCode] = timings[busStopCode].map(mapper);
    });
    return newTimings;
}

function filterService(timings, parsed) {
    return filter(timings, svc =>
        parsed.services.includes(svc.service)
    );
}

function filterWAB(timings, parsed) {
    if (parsed.wheelchair == -1) return timings;
    return map(timings, svc => {svc.timings = svc.timings.filter(arrival => arrival.isWAB == parsed.wheelchair); return svc;});
}

function filterType(timings, parsed) {
    if (parsed.types.length === 0) return timings;
    return map(timings, svc => {svc.timings = svc.timings.filter(arrival => parsed.types.includes(arrival.busType)); return svc;});
}

function filterEmpties(timings) {
    let newTimings = {};
    Object.keys(timings).map(busStopCode => {
        if (timings[busStopCode].length > 0) {
            if (timings[busStopCode].filter(svc => svc.timings.length > 0).length > 0)
                newTimings[busStopCode] = timings[busStopCode].filter(svc => svc.timings.length > 0);
        }
    });

    return newTimings;
}

function filterBuses(parsed) {
    let timings = filterType(filterWAB(filterService(getBusTimings(), parsed), parsed), parsed);

    return filterEmpties(timings);
}

module.exports = {filterBuses, parseQuery, resolveServices};
