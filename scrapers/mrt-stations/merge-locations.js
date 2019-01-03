let stationData = require('./station-data.json');
let stationLocations = require('./station-locations.json');
const fs = require('fs');

function getStationLine(stationNumber) {
    let line = null;

    Object.keys(stationData).forEach(lineName => {
        let {stations} = stationData[lineName];
        stations.forEach(station => {
            if (station.stationNumber === stationNumber)
                line = lineName;
        });
    });

    return line;
}

function getStationIndex(stationNumber) {
    let index = null;

    Object.keys(stationData).forEach(lineName => {
        let {stations} = stationData[lineName];
        stations.forEach((station, i) => {
            if (station.stationNumber === stationNumber)
                index = i;
        });
    });

    return index;
}

function handleStation(stationNumber, position) {
    let latitude = position[1],
        longitude = position[0];

    let line = getStationLine(stationNumber);
    let index = getStationIndex(stationNumber);

    stationData[line].stations[index].position = {
        latitude, longitude
    };
}

stationLocations.features.forEach(station => {
    let stationNumbers = station.properties.STN_NO;
    stationNumbers.split('/').map(e=>e.trim()).forEach(stationNumber => {
        handleStation(stationNumber, station.geometry.coordinates);
    });
});

fs.writeFile('./final-station-data.json', JSON.stringify(stationData, null, 4), () => {
    console.log('merged');
});
