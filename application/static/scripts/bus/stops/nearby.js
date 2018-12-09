function processLocation(location) {
    let {coords} = location;
    let {latitude, longitude} = coords;

    $.ajax({
        method: 'POST',
        data: {
            latitude, longitude
        }
    }, data => {
        $('#content').innerHTML = data;
    });
}

function error(err) {

}

$.ready(() => {
    if ('geolocation' in navigator) {
        let geo = navigator.geolocation;

        geo.watchPosition(processLocation, error, {
            enableHighAccuracy: true,
        });
    }
});
