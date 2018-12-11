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

router.get('/:lineName/:stationName', (req, res) => {
    let {lineName, stationName} = req.params;

    getMRTTimings(lineName, stationName, timings => {
        res.render('mrt/timings/results',
            {lineName, stationName, stationNumber: findStationNumber(lineName, stationName), timings: timings});
    });
});

module.exports = router;
