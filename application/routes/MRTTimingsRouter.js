let express = require('express');
let router = new express.Router();

let getMRTTimings = require('../timings/mrt');
let mrtLines = require('../timings/mrt/station-data');

router.get('/', (req, res) => {
    res.render('mrt/timings');
});

function findStationNumber(line, stationName) {
    let number = null;
    Object.keys(mrtLines).forEach(lineName => {
        let mrtLine = mrtLines[lineName];

        mrtLine.stations.forEach((stn, i) => {
            if (stn.stationName === stationName && lineName === line) {
                number = stn.stationNumber;
            }
        });
    });

    return number;
}

function findStationLines(stationName) {
    let lines = [];
    Object.keys(mrtLines).forEach(lineName => {
        let mrtLine = mrtLines[lineName];

        mrtLine.stations.forEach((stn, i) => {
            if (stn.stationName === stationName) {
                lines.push(lineName);
            }
        });
    });

    return lines;
}

function resolveDestinationLines(lineName, timings) {
    function abbv(line) {
        let abbvLine = lineName.split(' ').map(p=>p.slice(0, 1)).join('');
        if (abbvLine === 'CL') abbvLine = 'CCL';

        return abbvLine;
    }

    let dests = {};

    Object.keys(timings).forEach(currentLineName => {
        Object.keys(timings[currentLineName]).forEach(destinationName => {
            let possibleLines = findStationLines(destinationName);

            let biased = possibleLines.filter(possible => abbv(possible) == currentLineName);
            if (biased.length === 1) {
                dests[destinationName] = possibleLines.filter(possible => abbv(possible) == currentLineName)[0];
            } else {
                dests[destinationName] = possibleLines[0];
            }
        });
    });

    return dests;
}

router.get('/:lineName/:stationName', (req, res) => {
    let {lineName, stationName} = req.params;
    let stationNumber = findStationNumber(lineName, stationName);

    let allowedLines = ['North South Line', 'East West Line', 'Circle Line', 'Circle Line Extension', 'Changi Airport Branch Line'];
    if (!(allowedLines.includes(lineName))) {
        res.render('mrt/timings/results', {invalidLine: true, lineName, stationName, stationNumber});
        return;
    }

    getMRTTimings(lineName, stationName, timings => {
        let resolvedDests = resolveDestinationLines(lineName, timings);

        res.render('mrt/timings/results',
            {lineName, resolvedDests, stationName, stationNumber, timings: timings});
    });
});

module.exports = router;
