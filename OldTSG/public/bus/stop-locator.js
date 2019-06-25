function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

function parse(stops) {
    $('#output').innerHTML = '';
    stops.sort((a, b) => {
        return a.distance - b.distance;
    });
    for (let busStop of stops) {
        $('#output').innerHTML += 
`<div>
    <a class="bus-stop-code" href='/old/bus/timings/#stop=${busStop.busStopCode}'>
        <span>${busStop.busStopCode}</span></a>  
    <span class="stop-name">${busStop.name}</span>
    <div class="distance-box">
        <meter class="distance-meter" min=0 max=0.55039 optimum=0.2 low=0.3 high=0.4 value=${busStop.distance / 1000}></meter><span class="distance">${Math.round(busStop.distance)}m / 550m</span>
    </div>
</div>
`;
    }
}

window.lastLocation = [];

function loadStopsFromLocation(position) {
    var coords = [position.coords.latitude, position.coords.longitude];
    if (lastLocation[0] === coords[0] && lastLocation[1] === coords[1]) return;
    lastLocation = coords;
console.log('go')
    $.ajax({
        url: '/old/bus/stops/locate/query',
        method: 'POST',
        data: {
            coords: coords,
            _csrf: $('#csrf').value
        }
    }, (response) => {
        if ($('#request')) $.delete('#request');
        parse(response.busStops.map(stop=>{stop.distance = distance(stop.latitude, stop.longitude, coords[0], coords[1]) * 1000; return stop;}));
    });
}

window.on('load', () => {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(loadStopsFromLocation, error => {
            $.delete('#request');
            $('#error').textContent = error.message;
        });
        navigator.geolocation.watchPosition(loadStopsFromLocation);
    } else {
        $.delete('#request');
        $('#error').textContent = 'Your browser does not support geolocation!';
    }
});
