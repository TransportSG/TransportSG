let express = require('express');
let router = new express.Router();

let getMRTTimings = require('../timings/mrt');
let mrtLines = require('../timings/mrt/station-data');

let lineAbbreviations = {
  "North South Line": "NSL",
  "East West Line": "EWL",
  "Changi Airport Branch Line": "CGL",
  "North East Line": "NEL",
  "Circle Line": "CCL",
  "Circle Line Extension": "CEL",
  "Downtown Line": "DTL",
  "Bukit Panjang LRT": "BPL",
  "Sengkang LRT East Loop": "SEL",
  "Sengkang LRT West Loop": "SWL",
  "Punggol LRT East Loop": "PEL",
  "Punggol LRT West Loop": "PWL"
}

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

router.get('/:lineName/:stationName', (req, res) => {
    let {lineName, stationName} = req.params;
    let stationNumber = findStationNumber(lineName, stationName);

    let allowedLines = ['North South Line', 'East West Line', 'Circle Line', 'Circle Line Extension', 'Changi Airport Branch Line'];
    if (!(allowedLines.includes(lineName))) {
        res.render('mrt/timings/results', {invalidLine: true, lineName, stationName, stationNumber});
        return;
    }

    getMRTTimings(lineName, stationName, timings => {
        res.render('mrt/timings/results',
            {lineName, stationName, stationNumber, timings, lineAbbreviations});
    });
});

module.exports = router;
