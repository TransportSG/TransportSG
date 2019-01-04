let lineAbbreviations = {
  "North South Line": "nsl",
  "East West Line": "ewl",
  "Changi Airport Branch Line": "cgl",
  "North East Line": "nel",
  "Circle Line": "ccl",
  "Circle Line Extension": "cel",
  "Downtown Line": "dtl",
  "Bukit Panjang LRT": "bpl",
  "Sengkang LRT East Loop": "sel",
  "Sengkang LRT West Loop": "swl",
  "Punggol LRT East Loop": "pel",
  "Punggol LRT West Loop": "pwl"
}

function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 +
          c(lat1 * p) * c(lat2 * p) *
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

function getDistanceCssClass(distance) {
    if (distance >= 0 && distance < 0.1) return 'nearby';
    if (distance >= 0.1 && distance < 0.3) return 'close';
    else return 'far';
}

function render(stations) {
    let output = '';
    stations.forEach(station => {
        output +=
`<div class='mrtStation'>
    <a href='/timings/mrt/${station.lineName}/${station.station.stationName}' class='mrtStationLink'>
        <div class='distanceMeter ${getDistanceCssClass(station.distanceToStation)}'>
            <span class='distance'>${Math.round(station.distanceToStation * 1000)}</span>
            <span>metres</span>
        </div>
        <div class='stationInfo'>
            <span class='stationLine'>${station.lineName}</span>
            <span class='stationName'><span class='station-colouring ${lineAbbreviations[station.lineName]}'>${station.station.stationNumber}</span> ${station.station.stationName}</span>
        </div>
    </a>
</div>
`;
    });

    $('#content').innerHTML = output;
}

function processLocation(location) {
    let {coords} = location;
    let {latitude, longitude} = coords;

    let foundStations = [];

    Object.keys(stationData).forEach(lineName => {
        let {stations} = stationData[lineName];
        stations.forEach(station => {
            if (station.position && (station.operational !== false)) {
                let stationLat = station.position.latitude,
                    stationLong = station.position.longitude;

                let distanceToStation = distance(stationLat, stationLong, latitude, longitude);
                if (distanceToStation <= 0.5) {
                    foundStations.push({ distanceToStation, station, lineName });
                }
            }
        });
    });

    foundStations = foundStations.sort((a, b) => a.distanceToStation - b.distanceToStation);
    render(foundStations);
}

function error(err) {
    $('#content').innerHTML = `<div class='error'><span class='errorMessage'>${err.message}</span></div>`;
}

$.ready(() => {
    if ('geolocation' in navigator) {
        let geo = navigator.geolocation;

        geo.watchPosition(processLocation, error, {
            enableHighAccuracy: true,
        });
    }
});
