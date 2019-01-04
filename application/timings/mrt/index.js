const fs = require('fs');
const request = require('request');
const {JSDOM} = require('jsdom');

let mrtLines = require('./station-data');
let supportingData = require('./support');

function groupTimings(timings) {
    let lines = {};

    timings.forEach(timing => {
        let {trainLine, arrivalInMin, destination} = timing;
        lines[trainLine] = lines[trainLine] || {};
        lines[trainLine][destination] = lines[trainLine][destination] || [];
        lines[trainLine][destination].push(arrivalInMin);
    });

    return lines;
}

function findStationCode(line, stationName) {
    let code = null;
    Object.keys(mrtLines).forEach(lineName => {
        let mrtLine = mrtLines[lineName];

        mrtLine.stations.forEach((stn, i) => {
            if (stn.stationName === stationName && lineName === line) {
                code = stn.stationCode;
            }
        });
    });
    return code;
}

function performRequest(stationCode, callback) {
    request.post({
        url: 'https://trainarrivalweb.smrt.com.sg/default.aspx',
        headers: supportingData.headers,
        body: supportingData.query + stationCode,
        gzip: true
    }, (err, resp, body) => {
        callback(new JSDOM(body));
    });
}

function extractTimings(dom, stationName) {
    let allTimings = [];

    let document = dom.window.document;
    let tableHeaders = Array.from(document.querySelectorAll('span[style="display:inline-block;color:Black;font-weight:bold;width:392px;"]'))
        .map(header => header.textContent.trim()).filter(header => header !== '');
    let tables = Array.from(document.querySelectorAll('span[style="display:inline-block;color:Black;font-weight:bold;width:392px;"] + div'));

    let pairs = [];
    tableHeaders.forEach((header, i) => {
        pairs.push({header, table: tables[i]});
    });

    pairs.forEach(data => {
        let {header, table} = data;
        let trainData = header.match(/^(\w+) in the direction of \w+/);

        let trainLine = trainData[1];

        let timings = Array.from(table.querySelectorAll('tr:nth-child(2) > td'));
        let destinations = Array.from(table.querySelectorAll('tr:nth-child(3) > td'));

        timings.forEach((timing, i) => {
            let arrivalInMin = timing.textContent.match(/(\d+)/);
            if (!arrivalInMin) return;
            arrivalInMin = arrivalInMin[1];

            let destination = destinations[i].textContent;

            if (destination === 'Do not board') return;

            if (trainLine === 'CCL' && stationName === 'Dhoby Ghaut')
                destination = 'Harbourfront'

            allTimings.push({
                trainLine,
                arrivalInMin,
                destination
            });
        });
    });

    return allTimings;
}

function getStationTimings(line, stationName, callback) {
    let stationCode = findStationCode(line, stationName);
    performRequest(stationCode, dom => {
        let timings = groupTimings(extractTimings(dom, stationName));

        Object.keys(timings).forEach(lineName => {
            let destinations = timings[lineName];

            Object.keys(destinations).forEach(destinationName => {
                timings[lineName][destinationName] = timings[lineName][destinationName].filter((time, i, a) =>
                    a.indexOf(time) === i
                ).sort((a, b) => a - b);
            });
        });

        callback(timings);
    });
}

module.exports = getStationTimings;
